import ajv from '../../../libs/ajv'
import { plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { getCardPoints, getTotalCards } from '../../../utils/game.utils'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import BlackJackGameGenerateResultService from './blackJackGameGenerateResult.service'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import BlackJackGameResolveSplitBetsService from './blackJackGameResolveSplitBets.service'
import { BLACKJACK, BLACKJACK_ODDS, BLACKJACK_RESULT, DEFAULT_GAME_ID, BET_RESULT, TOTAL_CARDS, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    betId: { type: 'number' }
  },
  required: ['betId']
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class BlackJackGameStandService
 * @extends {ServiceBase}
 */
export default class BlackJackGameStandService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betId } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        Transaction: TransactionModel,
        BlackJackGameBet: BlackJackGameBetModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    // Fetching user details
    const user = await UserModel.findOne({
      attributes: ['userName'],
      where: {
        id: userId
      },
      transaction: sequelizeTransaction
    })

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    const blackJackGameBet = await BlackJackGameBetModel.findOne({
      where: { userId, result: null, parentBetId: null, id: betId },
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: BlackJackGameBetModel },
      transaction: sequelizeTransaction
    })

    if (!blackJackGameBet) {
      this.addError('NoPlacedBetFoundErrorType')
      return
    }

    const dealerHand = JSON.parse(JSON.stringify(blackJackGameBet.dealerHand))
    const playerHand = JSON.parse(JSON.stringify(blackJackGameBet.playerHand))

    let winningAmount = null
    let gameResult = null
    let result = null
    let dealersAcePoint = 0
    let dealersPoint = 0
    let totalCards = 0
    let allBetsInCurrentRound = []

    if (blackJackGameBet.isSplit) {
      allBetsInCurrentRound = await BlackJackGameBetModel.findAll({
        where: { userId, roundId: blackJackGameBet.roundId },
        transaction: sequelizeTransaction
      })
      totalCards = getTotalCards(allBetsInCurrentRound)
    } else {
      totalCards = TOTAL_CARDS - (playerHand.length + dealerHand.length)
    }

    while (Math.max(dealersPoint, dealersAcePoint) <= 17) {
      dealerHand.push(
        (await BlackJackGameGenerateResultService.execute({
          clientSeed: blackJackGameBet.clientSeed,
          serverSeed: blackJackGameBet.serverSeed,
          totalCards
        })).result
      )
      const points = getCardPoints(dealerHand)
      dealersAcePoint = points.acePoints
      dealersPoint = points.cardPoints
      totalCards -= 1
    }

    if (blackJackGameBet.isSplit) {
      return (await BlackJackGameResolveSplitBetsService.execute({
        dealerHand: [...dealerHand],
        dealersAcePoint,
        dealersPoint,
        allBets: allBetsInCurrentRound
      }, this.context)).result
    }

    if (dealersPoint > BLACKJACK && dealersAcePoint > BLACKJACK) {
      gameResult = BLACKJACK_RESULT.DEALER_BUST
      result = BET_RESULT.WON
      winningAmount = times(blackJackGameBet.betAmount, BLACKJACK_ODDS.WIN)
    } else if (Math.max(dealersPoint, dealersAcePoint) === BLACKJACK) {
      gameResult = BLACKJACK_RESULT.DEALERS_BLACKJACK
      result = BET_RESULT.LOST
      winningAmount = 0
    } else if (Math.max(dealersPoint, dealersAcePoint) > Math.max(blackJackGameBet.playersPoint, blackJackGameBet.playersAcePoint)) {
      gameResult = BLACKJACK_RESULT.DEALER_WIN
      result = BET_RESULT.LOST
      winningAmount = 0
    } else if (Math.max(blackJackGameBet.playersPoint, blackJackGameBet.playersAcePoint) > Math.max(dealersPoint, dealersAcePoint)) {
      gameResult = BLACKJACK_RESULT.PLAYER_WIN
      result = BET_RESULT.WON
      winningAmount = times(blackJackGameBet.betAmount, BLACKJACK_ODDS.WIN)
    } else {
      gameResult = BLACKJACK_RESULT.PUSH
      result = BET_RESULT.CANCELLED
      winningAmount = 0
    }

    try {
      // Saving Game State
      const blackJackResult = await blackJackGameBet.update({
        dealerHand: [...dealerHand],
        winningAmount,
        dealersAcePoint,
        dealersPoint,
        gameResult,
        result
      }, { transaction: sequelizeTransaction })

      if (winningAmount !== null) {
        const debitTransaction = await TransactionModel.findOne({
          where: {
            betId: blackJackGameBet.id,
            gameId: DEFAULT_GAME_ID.BLACKJACK,
            actioneeId: userId,
            transactionType: TRANSACTION_TYPES.BET
          },
          raw: true,
          transaction: sequelizeTransaction
        })

        const userWallet = await WalletModel.findOne({
          where: { ownerType: USER_TYPES.USER, ownerId: userId, currencyId: blackJackGameBet.currencyId },
          include: [{
            attributes: ['code'],
            model: CurrencyModel,
            as: 'currency'
          }],
          lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
          transaction: sequelizeTransaction
        })

        // if (debitTransaction.paymentMethod === PAYMENT_METHODS.BONUS) {
        //   userWallet.nonCashAmount = plus(userWallet.nonCashAmount, blackJackGameBet.winningAmount)
        // } else {
        userWallet.amount = plus(userWallet.amount, blackJackGameBet.winningAmount)
        // }

        await userWallet.save({ transaction: sequelizeTransaction })

        await CreateCreditTransactionService.execute({
          gameId: DEFAULT_GAME_ID.BLACKJACK,
          userWallet,
          betData: blackJackGameBet,
          debitTransaction
        }, this.context)

        WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      }

      return blackJackResult
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

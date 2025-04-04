import ajv from '../../../libs/ajv'
import { plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { getCardPoints, getTotalCards } from '../../../utils/game.utils'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import BlackJackGameGenerateResultService from './blackJackGameGenerateResult.service'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
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
 * @class BlackJackGameHitService
 * @extends {ServiceBase}
 */
export default class BlackJackGameHitService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betId } = this.args

    const {
      dbModels: {
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

    const blackJackGameBet = await BlackJackGameBetModel.findOne({
      where: { userId, id: betId, result: null },
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: BlackJackGameBetModel },
      transaction: sequelizeTransaction
    })

    if (!blackJackGameBet) {
      this.addError('NoPlacedBetFoundErrorType')
      return
    }

    const playerHand = JSON.parse(JSON.stringify(blackJackGameBet.playerHand))

    if (blackJackGameBet.isSplit) {
      if (Math.max(blackJackGameBet.playersPoint, blackJackGameBet.playersAcePoint) > BLACKJACK) {
        this.addError('BlackJackGameSplitHitErrorType')
        return
      }

      const allBetsInCurrentRound = await BlackJackGameBetModel.findAll({
        where: { userId, roundId: blackJackGameBet.roundId },
        transaction: sequelizeTransaction
      })

      playerHand.push(
        (await BlackJackGameGenerateResultService.execute({
          clientSeed: blackJackGameBet.clientSeed,
          serverSeed: blackJackGameBet.serverSeed,
          totalCards: getTotalCards(allBetsInCurrentRound)
        })).result
      )
    } else {
      playerHand.push(
        (await BlackJackGameGenerateResultService.execute({
          clientSeed: blackJackGameBet.clientSeed,
          serverSeed: blackJackGameBet.serverSeed,
          totalCards: TOTAL_CARDS - (blackJackGameBet.playerHand.length + blackJackGameBet.dealerHand.length)
        })).result
      )
    }

    const { acePoints: playersAcePoint, cardPoints: playersPoint } = getCardPoints(playerHand)

    let winningAmount = null
    let gameResult = null
    let result = null

    if (!blackJackGameBet.isSplit) {
      if (playersPoint > BLACKJACK && playersAcePoint > BLACKJACK) {
        gameResult = BLACKJACK_RESULT.PLAYER_BUST
        result = BET_RESULT.LOST
        winningAmount = 0
      } else if (Math.max(playersPoint, playersAcePoint) === BLACKJACK) {
        gameResult = BLACKJACK_RESULT.PLAYERS_BLACKJACK
        result = BET_RESULT.WON
        winningAmount = times(blackJackGameBet.betAmount, BLACKJACK_ODDS.BLACKJACK)
      }
    }

    try {
      // Saving Game State
      await blackJackGameBet.update({
        playerHand: [...playerHand],
        winningAmount,
        playersAcePoint,
        playersPoint,
        gameResult,
        result
      }, { transaction: sequelizeTransaction })

      const response = {
        id: betId,
        playerHand: blackJackGameBet.playerHand,
        playersPoint,
        playersAcePoint,
        gameResult,
        result
      }

      if (blackJackGameBet.isSplit) {
        return response
      }

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

        response.winningAmount = winningAmount
        response.dealerHand = blackJackGameBet.dealerHand
        response.dealersPoint = blackJackGameBet.dealersPoint
        response.dealersAcePoint = blackJackGameBet.dealersAcePoint
      }

      return response
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

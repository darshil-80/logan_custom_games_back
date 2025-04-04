import ajv from '../../../libs/ajv'
import { v4 as uuidv4 } from 'uuid'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { minus, plus, times } from 'number-precision'
import { getCachedData } from '../../../helpers/redis.helpers'
import GameSettingsService from '../common/gameSettings.service'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import { canDoubleBet, canSplitBet, getCardPoints } from '../../../utils/game.utils'
import BlackJackGameGenerateResultService from './blackJackGameGenerateResult.service'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import { BLACKJACK, BLACKJACK_ODDS, BLACKJACK_RESULT, DEFAULT_GAME_ID, BET_RESULT, TOTAL_CARDS } from '../../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    betAmount: { $ref: '/blackJackGameBet.json#/properties/betAmount' },
    currencyId: { $ref: '/wallet.json#/properties/currencyId' },
    clientSeed: { $ref: '/blackJackGameBet.json#/properties/clientSeed' }
  },
  required: ['clientSeed', 'betAmount', 'currencyId']
}

const constraints = ajv.compile(schema)

/**
 * @export
 * @class BlackJackGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class BlackJackGamePlaceBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betAmount, clientSeed, currencyId } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
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
      include: [{
        model: WalletModel,
        as: 'wallets',
        where: { currencyId },
        include: [{
          attributes: ['code'],
          model: CurrencyModel,
          as: 'currency'
        }],
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }
      }],
      transaction: sequelizeTransaction
    })

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    const userWallet = user.wallets?.length ? user.wallets[0] : null

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    // to check previous round is completed or not
    const previousRoundBet = await BlackJackGameBetModel.findOne({
      where: { userId, result: null, gameResult: null, parentBetId: null },
      raw: true,
      transaction: sequelizeTransaction
    })

    if (previousRoundBet) {
      this.addError('BlackJackPreviousRoundNotCompletedErrorType')
      return
    }

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.BLACKJACK.toString() }, this.context)).result
    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) {
      this.addError('ServerSeedNotFoundErrorType')
    }

    // Get Cards
    const playerHand = [
      (await BlackJackGameGenerateResultService.execute({ clientSeed, serverSeed, totalCards: TOTAL_CARDS })).result,
      (await BlackJackGameGenerateResultService.execute({ clientSeed, serverSeed, totalCards: TOTAL_CARDS - 1 })).result
    ]
    const dealerHand = [
      (await BlackJackGameGenerateResultService.execute({ clientSeed, serverSeed, totalCards: TOTAL_CARDS - 2 })).result,
      (await BlackJackGameGenerateResultService.execute({ clientSeed, serverSeed, totalCards: TOTAL_CARDS - 3 })).result
    ]

    // Calculating points
    const { acePoints: playersAcePoint, cardPoints: playersPoint } = getCardPoints(playerHand)
    const { acePoints: dealersAcePoint, cardPoints: dealersPoint } = getCardPoints(dealerHand)

    let winningAmount = null
    let gameResult = null
    let result = null

    if (Math.max(playersPoint, playersAcePoint) === BLACKJACK && Math.max(dealersPoint, dealersAcePoint) === BLACKJACK) {
      gameResult = BLACKJACK_RESULT.PUSH
      result = BET_RESULT.CANCELLED
    } else if (Math.max(dealersPoint, dealersAcePoint) === BLACKJACK) {
      gameResult = BLACKJACK_RESULT.DEALERS_BLACKJACK
      result = BET_RESULT.LOST
      winningAmount = 0
    } else if (Math.max(playersPoint, playersAcePoint) === BLACKJACK) {
      gameResult = BLACKJACK_RESULT.PLAYERS_BLACKJACK
      result = BET_RESULT.WON
      winningAmount = times(betAmount, BLACKJACK_ODDS.BLACKJACK)
    }

    // create debit transaction

    try {
      const blackJackGameBet = await BlackJackGameBetModel.create({
        userId: userId,
        betAmount,
        currencyId,
        winningAmount,
        playerHand,
        playersPoint,
        dealerHand,
        dealersPoint,
        dealersAcePoint,
        playersAcePoint,
        roundId: uuidv4(),
        currentGameSettings: JSON.stringify({
          minOdd: gameSettings.minOdd,
          maxOdd: gameSettings.maxOdd,
          houseEdge: gameSettings.houseEdge
        }),
        clientSeed: clientSeed,
        serverSeed,
        gameResult,
        result
      }, {
        include: {
          model: UserModel,
          as: 'user'
        },
        transaction: sequelizeTransaction
      })

      // let isPaymentMethodBonus = false

      // Updating user wallet
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      // // deduct from nonCashAmount first
      // if (userWallet.nonCashAmount >= betAmount) {
      //   isPaymentMethodBonus = true

      //   if (result !== BET_RESULT.CANCELLED) {
      //     userWallet.nonCashAmount = minus(userWallet.nonCashAmount, betAmount)
      //     WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      //   }

      //   if (winningAmount !== null) {
      //     userWallet.nonCashAmount = plus(userWallet.nonCashAmount, winningAmount)
      //   }
      // } else {
      if (result !== BET_RESULT.CANCELLED) {
        userWallet.amount = minus(userWallet.amount, betAmount)
        WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      }

      if (winningAmount !== null) {
        userWallet.amount = plus(userWallet.amount, winningAmount)
      }
      // }

      await userWallet.save({ transaction: sequelizeTransaction })

      const debitTransaction = await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.BLACKJACK,
        userWallet,
        betData: blackJackGameBet
        // isPaymentMethodBonus
      }, this.context)

      const response = {
        id: blackJackGameBet.id,
        playerHand,
        playersPoint,
        playersAcePoint,
        dealerHand: dealerHand.splice(0, 1),
        gameResult,
        result,
        double: canDoubleBet(playerHand),
        split: canSplitBet(playerHand)
      }

      if (winningAmount !== null) {
        await CreateCreditTransactionService.execute({
          gameId: DEFAULT_GAME_ID.DICE,
          userWallet,
          betData: blackJackGameBet,
          debitTransaction
        }, this.context)

        response.winningAmount = winningAmount
        response.dealerHand = blackJackGameBet.dealerHand
        response.dealersPoint = blackJackGameBet.dealersPoint
        response.dealersAcePoint = blackJackGameBet.dealersAcePoint
      }

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      return { ...response, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

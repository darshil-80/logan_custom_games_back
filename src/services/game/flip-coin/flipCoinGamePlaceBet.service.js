import { minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import { getCachedData } from '../../../helpers/redis.helpers'
import ajv from '../../../libs/ajv'
import { BET_RESULT, DEFAULT_GAME_ID } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { calculateOdds, countOnes, getCoinOutcomeProbability } from '../../../utils/math.utils'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import GameSettingsService from '../common/gameSettings.service'
import FlipCoinGameGenerateResultService from './flipCoinGameGenerateResult.service'
import { v4 as uuid } from 'uuid'
import UpdateRankingLevelService from '../../bonus/updateRankingLevel.service'
import HandleBonusWageringService from '../../bonus/handleBonusWagering.service'

const schema = {
  type: 'object',
  properties: {
    numberOfCoins: { $ref: '/flipCoinGameBet.json#/properties/numberOfCoins' },
    minimumChosenOutcome: { $ref: '/flipCoinGameBet.json#/properties/minimumChosenOutcome' },
    heads: { $ref: '/flipCoinGameBet.json#/properties/heads' },
    betAmount: { $ref: '/flipCoinGameBet.json#/properties/betAmount' },
    clientSeed: { $ref: '/flipCoinGameBet.json#/properties/clientSeed' },
    currencyId: { $ref: '/flipCoinGameBet.json#/properties/currencyId' },
    demo: { type: 'boolean' },
    demoAmount: { $ref: '/flipCoinGameBet.json#/properties/demoAmount' }
  },
  required: ['numberOfCoins', 'heads', 'clientSeed', 'betAmount', 'currencyId']
}

const constraints = ajv.compile(schema)

/**
 *
 *
 * @export
 * @class FlipCoinGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class FlipCoinGamePlaceBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { currencyId, numberOfCoins, heads, betAmount, clientSeed, minimumChosenOutcome, demo } = this.args

    if (demo) {
      let { demoAmount } = this.args
      if (!demoAmount) demoAmount = 3000
      if (+betAmount > +demoAmount) return this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${demoAmount} betAmount ${betAmount}`)
      // Roll Dice
      const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.FLIP_COIN.toString() }, this.context)).result

      const _serverSeed = Math.random().toString(36).substring(2, 12)
      const flipCoinGameResult = await FlipCoinGameGenerateResultService.run({ serverSeed: _serverSeed, clientSeed, numberOfCoins })
      const ones = countOnes(flipCoinGameResult)
      const favorable = heads ? ones : (numberOfCoins - ones)

      let winningAmount = 0
      let betResult = BET_RESULT.LOST

      const probability = getCoinOutcomeProbability(numberOfCoins, minimumChosenOutcome)

      if (favorable >= minimumChosenOutcome) {
        const odds = calculateOdds(gameSettings, 1 / probability)
        betResult = BET_RESULT.WON
        winningAmount = times(betAmount, odds)
      }

      let balance = minus(demoAmount, betAmount)

      if (betResult === BET_RESULT.WON) {
        balance = plus(balance, winningAmount)
      }

      return {
        id: uuid(),
        outcome: flipCoinGameResult,
        betAmount: betAmount,
        currencyId,
        winningAmount: winningAmount,
        clientSeed: clientSeed,
        serverSeed: _serverSeed,
        result: betResult,
        demo: true,
        demoAmount: balance,
        minimumChosenOutcome,
        numberOfCoins
      }
    }

    const {
      dbModels: {
        User: UserModel,
        FlipCoinGameBet: FlipCoinGameBetModel,
        Wallet: WalletModel,
        Currency: CurrencyModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    // numberOfCoins validation
    if (numberOfCoins < 1 || numberOfCoins > 10) {
      this.addError('InvalidNumberOfCoins')
      return
    }

    // minimumChosenOutcome Validation
    if (minimumChosenOutcome < 1 || minimumChosenOutcome > numberOfCoins || (minimumChosenOutcome < Math.floor(numberOfCoins / 3))) {
      this.addError('InvalidMinimumChosenOutcomeErrorType')
      return
    }

    // Fetching user details
    const user = await UserModel.findOne({
      attributes: ['userName'],
      where: {
        id: userId
      },
      include: [{
        model: WalletModel,
        as: 'wallets',
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
        where: { currencyId },
        include: [{
          attributes: ['code'],
          model: CurrencyModel,
          as: 'currency'
        }]
      }],
      transaction: sequelizeTransaction
    })

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    // const userWallet = user.wallets?.length ? user.wallets[0] : null
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    const gameSettings = await GameSettingsService.run({ gameId: DEFAULT_GAME_ID.FLIP_COIN.toString() }, this.context)
    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) {
      this.addError('ServerSeedNotFoundErrorType')
    }

    const flipCoinGameResult = await FlipCoinGameGenerateResultService.run({ serverSeed, clientSeed, numberOfCoins })
    const ones = countOnes(flipCoinGameResult)
    const favorable = heads ? ones : (numberOfCoins - ones)

    let winningAmount = 0
    let betResult = BET_RESULT.LOST

    const probability = getCoinOutcomeProbability(numberOfCoins, minimumChosenOutcome)

    if (favorable >= minimumChosenOutcome) {
      const odds = calculateOdds(gameSettings, 1 / probability)
      betResult = BET_RESULT.WON
      winningAmount = times(betAmount, odds)
      const profit = minus(winningAmount, betAmount)

      if (profit > maxBetProfit.amount) {
        winningAmount = plus(betAmount, maxBetProfit.amount)
      }
    }

    const { minOdd, maxOdd, houseEdge } = gameSettings

    // create debit transaction
    try {
      const flipCoinGameBet = await FlipCoinGameBetModel.create({
        userId: userId,
        outcome: flipCoinGameResult,
        heads,
        numberOfCoins,
        minimumChosenOutcome,
        betAmount,
        currencyId,
        winningAmount,
        clientSeed: clientSeed,
        serverSeed,
        result: betResult,
        currentGameSettings: JSON.stringify({ minOdd, maxOdd, houseEdge })
      }, {
        include: [{
          model: UserModel,
          as: 'user'
        }],
        transaction: sequelizeTransaction
      })

      let isPaymentMethodBonus = false

      // Updating user wallet
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      // deduct from nonCashAmount first
      if (userWallet.nonCashAmount >= betAmount) {
        isPaymentMethodBonus = true
        userWallet.nonCashAmount = minus(userWallet.nonCashAmount, betAmount)
        WalletEmitter.emitUserWalletBalance({ ...userWallet?.toJSON(), type: 'debit', betInfo: flipCoinGameBet }, userWallet.ownerId)

        if (betResult === BET_RESULT.WON) {
          userWallet.amount = plus(userWallet.amount, winningAmount)
        }
      } else {
        userWallet.amount = minus(userWallet.amount, betAmount)
        WalletEmitter.emitUserWalletBalance({ ...userWallet?.toJSON(), type: 'debit', betInfo: flipCoinGameBet }, userWallet.ownerId)

        if (betResult === BET_RESULT.WON) {
          userWallet.amount = plus(userWallet.amount, winningAmount)
        }
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      const debitTransaction = await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.FLIP_COIN,
        userWallet,
        betData: flipCoinGameBet,
        isPaymentMethodBonus
      }, this.context)

      await CreateCreditTransactionService.execute({
        gameId: DEFAULT_GAME_ID.FLIP_COIN,
        userWallet,
        betData: flipCoinGameBet,
        debitTransaction
      }, this.context)
      await HandleBonusWageringService.execute({ userId, userWalletId: userWallet.id, betAmount: +betAmount }, this.context)
      await UpdateRankingLevelService.execute({ userId }, this.context)

      WalletEmitter.emitUserWalletBalance({ ...userWallet?.toJSON(), type: 'credit', betInfo: flipCoinGameBet }, userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      flipCoinGameBet.nextServerSeedHash = nextServerSeedHash

      return { ...flipCoinGameBet.dataValues, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

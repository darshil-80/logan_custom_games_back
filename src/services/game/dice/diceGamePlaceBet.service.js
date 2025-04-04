import ajv from '../../../libs/ajv'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { minus, plus, times } from 'number-precision'
import { calculateOdds } from '../../../utils/math.utils'
import { getCachedData } from '../../../helpers/redis.helpers'
import GameSettingsService from '../common/gameSettings.service'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import DiceGameGenerateResultService from './diceGameGenerateResult.service'
import { DEFAULT_GAME_ID, BET_RESULT } from '../../../libs/constants'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'

const schema = {
  type: 'object',
  properties: {
    number: { $ref: '/diceGameBet.json#/properties/number' },
    rollOver: { $ref: '/diceGameBet.json#/properties/rollOver' },
    betAmount: { $ref: '/diceGameBet.json#/properties/betAmount' },
    currencyId: { $ref: '/wallet.json#/properties/currencyId' },
    clientSeed: { $ref: '/diceGameBet.json#/properties/clientSeed' },
    demo: { type: 'boolean' },
    demoAmount: { type: 'number' }
  },
  required: ['number', 'rollOver', 'clientSeed', 'betAmount', 'currencyId']
}

const constraints = ajv.compile(schema)

/**
 *
 *
 * @export
 * @class DiceGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class DiceGamePlaceBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { number, rollOver, betAmount, clientSeed, currencyId, demo } = this.args
    let { demoAmount } = this.args

    if (demo) {
      if (!demoAmount) demoAmount = 3000
      if (+betAmount > +demoAmount) return this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${demoAmount} betAmount ${betAmount}`)
      // Roll Dice
      const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.DICE.toString() }, this.context)).result

      const diceGameResult = await DiceGameGenerateResultService.execute({ serverSeed: Math.random().toString(36).substring(2, 12), clientSeed })

      let winningAmount = 0
      let betResult = BET_RESULT.LOST
      const probability = rollOver ? (100 - number) / 101 : (number / 101)
      const odds = calculateOdds(gameSettings, 1 / probability)

      if ((rollOver && +diceGameResult.result > number) || (!rollOver && +diceGameResult.result < number)) {
        betResult = BET_RESULT.WON
        winningAmount = times(betAmount, odds)
      }

      let balance = minus(demoAmount, betAmount)

      if (betResult === BET_RESULT.WON) {
        balance = plus(balance, winningAmount)
      }

      return {
        number,
        winningNumber: diceGameResult.result,
        rollOver,
        betAmount: betAmount.toString(),
        currencyId,
        winningAmount: winningAmount.toString(),
        clientSeed: clientSeed,
        result: betResult,
        demo: true,
        demoAmount: balance,
        multiplier: odds
      }
    }

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        DiceGameBet: DiceGameBetModel
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
        }]
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

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.DICE.toString() }, this.context)).result
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

    // Roll Dice
    const diceGameResult = await DiceGameGenerateResultService.execute({ serverSeed, clientSeed })

    let winningAmount = 0
    let betResult = BET_RESULT.LOST
    const probability = rollOver ? (100 - number) / 101 : (number / 101)

    if ((rollOver && +diceGameResult.result > number) || (!rollOver && +diceGameResult.result < number)) {
      const odds = calculateOdds(gameSettings, 1 / probability)
      betResult = BET_RESULT.WON
      winningAmount = times(betAmount, odds)
      const profit = minus(winningAmount, betAmount)

      if (profit > +maxBetProfit.amount) {
        winningAmount = plus(betAmount, maxBetProfit.amount)
      }
    }

    // create debit transaction

    try {
      const diceGameBet = await DiceGameBetModel.create({
        userId: userId,
        number,
        winningNumber: diceGameResult.result,
        rollOver,
        betAmount,
        currencyId,
        winningAmount,
        currentGameSettings: JSON.stringify({
          minOdd: gameSettings.minOdd,
          maxOdd: gameSettings.maxOdd,
          houseEdge: gameSettings.houseEdge
        }),
        clientSeed: clientSeed,
        serverSeed,
        result: betResult
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
      //   // isPaymentMethodBonus = true
      //   userWallet.nonCashAmount = minus(userWallet.nonCashAmount, betAmount)
      //   WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      //   if (betResult === BET_RESULT.WON) {
      //     userWallet.nonCashAmount = plus(userWallet.nonCashAmount, winningAmount)
      //   }
      // } else {

      userWallet.amount = minus(userWallet.amount, betAmount)
      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      if (betResult === BET_RESULT.WON) {
        userWallet.amount = plus(userWallet.amount, winningAmount)
      }
      // }

      await userWallet.save({ transaction: sequelizeTransaction })

      const debitTransaction = await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.DICE,
        userWallet,
        betData: diceGameBet
        // isPaymentMethodBonus
      }, this.context)

      await CreateCreditTransactionService.execute({
        gameId: DEFAULT_GAME_ID.DICE,
        userWallet,
        betData: diceGameBet,
        debitTransaction
      }, this.context)

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      const diceGameSettings = JSON.parse(diceGameBet.currentGameSettings)
      const probability = diceGameBet.rollOver ? (100 - number) / 101 : number / 101
      const multiplier = calculateOdds(diceGameSettings, 1 / probability)

      return { ...diceGameBet.dataValues, nextServerSeedHash, multiplier }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

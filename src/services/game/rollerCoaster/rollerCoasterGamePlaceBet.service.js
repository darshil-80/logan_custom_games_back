import { divide, minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ajv from '../../../libs/ajv'
import { BET_STATUS, DEFAULT_GAME_ID, ROLLER_COASTER_GAME_STATE } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { roundOf } from '../../../utils/math.utils'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import GameSettingsService from '../common/gameSettings.service'
import UpdateRankingLevelService from '../../bonus/updateRankingLevel.service'
import sequelize, { Op } from 'sequelize'

// import HandleBonusWageringService from '../../bonus/handleBonusWagering.service'

const schema = {
  type: 'object',
  properties: {
    multiplier: { type: 'number' },
    betAmount: { type: 'number' },
    currencyId: { type: 'string' },
    isBuy: { type: 'boolean' },
    stopLossAmount: { type: 'number' },
    takeProfitAmount: { type: 'number' }
  },
  required: ['multiplier', 'betAmount', 'currencyId', 'isBuy']
}

const constraints = ajv.compile(schema)

/**
 *
 *
 * @export
 * @class RollerCoasterGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class RollerCoasterGamePlaceBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    console.log('roller coaster place bet service stated ----------> ', new Date().toISOString())
    const { multiplier, betAmount, currencyId, isBuy, stopLossAmount, takeProfitAmount } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        RollerCoasterGameBet: RollerCoasterGameBetModel,
        RollerCoasterGameRoundDetail: RollerCoasterGameRoundDetailModel,
        RollerCoasterGameTickPrice: RollerCoasterGameTickPriceModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    console.log('roller coaster place bet query 1 stated ----------> ', new Date().toISOString())
    const currentRound = await RollerCoasterGameRoundDetailModel.findOne({
      where: {
        roundState: ROLLER_COASTER_GAME_STATE.STARTED
      },
      include: [{
        model: RollerCoasterGameTickPriceModel,
        as: 'tickers',
        where: {
          created_at: {
            [Op.gte]: sequelize.literal('date(now()) - 1')
          }
        },
        order: [['id', 'desc']],
        limit: 1,
        required: true
      }],
      transaction: sequelizeTransaction
    })

    console.log('roller coaster place bet query 1 ended ----------> ', new Date().toISOString())

    if (!currentRound) {
      this.addError('NoRoundRunningErrorType', 'no round is running')
      return
    }

    const entryPrice = currentRound.tickers[0].currentPrice

    // bust price formula for buy BustPrice = EntryPrice * (1 - 1/multiplier)
    let bustPrice = roundOf(times(entryPrice, minus(1, divide(1, multiplier))), 5)
    let takeProfitPrice = 0; let stopLossPrice = 0

    // take profit price formula for buy TakeProfitPrice = EntryPrice * (1 + (TakeProfitAmount/BetAmount) * multiplier)
    // stop loss price formula for buy StopLossPrice = EntryPrice * (1 - (StopLossAmount/BetAmount) * multiplier)
    if (takeProfitAmount > 0) {
      takeProfitPrice = roundOf(times(entryPrice, plus(1, (divide(divide(takeProfitAmount, betAmount), multiplier)))), 2)
    }
    if (stopLossAmount > 0) {
      stopLossPrice = roundOf(times(entryPrice, minus(1, (divide(divide(stopLossAmount, betAmount), multiplier)))), 2)
    }

    if (!isBuy) {
      // bust price formula for sell BustPrice = EntryPrice * (1 + 1/multiplier)
      bustPrice = roundOf(times(entryPrice, plus(1, divide(1, multiplier))), 2)

      // take profit price formula for buy TakeProfitPrice = EntryPrice * (1 - (TakeProfitAmount/BetAmount) * multiplier)
      // stop loss price formula for buy StopLossPrice = EntryPrice * (1 + (StopLossAmount/BetAmount) * multiplier)
      if (takeProfitAmount > 0) {
        takeProfitPrice = roundOf(times(entryPrice, minus(1, (divide(divide(takeProfitAmount, betAmount), multiplier)))), 2)
      }
      if (stopLossAmount > 0) {
        stopLossPrice = roundOf(times(entryPrice, plus(1, (divide(divide(stopLossAmount, betAmount), multiplier)))), 2)
      }
    }

    if (stopLossPrice && ((isBuy && bustPrice > stopLossPrice) || (!isBuy && bustPrice < stopLossPrice))) {
      this.addError('InvalidStopLossPriceType', 'no round is running')
      return
    }

    console.log('roller coaster place bet query 2 started ----------> ', new Date().toISOString())
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
        required: true,
        where: { currencyId },
        include: [{
          attributes: ['code'],
          model: CurrencyModel,
          as: 'currency'
        }]
      }],
      transaction: sequelizeTransaction
    })
    console.log('roller coaster place bet query 2 ended ----------> ', new Date().toISOString())
    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    const userWallet = await user.wallets[0].reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    const gameSettings = await GameSettingsService.run({ gameId: DEFAULT_GAME_ID.ROLLER_COASTER.toString() }, this.context)
    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }

    // create debit transaction

    try {
      console.log('roller coaster place bet query 3 start ----------> ', new Date().toISOString())
      const rollerCoasterGameBet = await RollerCoasterGameBetModel.create({
        roundId: currentRound.roundId,
        userId: userId,
        multiplier,
        entryPrice,
        isBuy,
        betAmount,
        currencyId,
        bustPrice,
        stopLossPrice,
        takeProfitPrice,
        betStatus: BET_STATUS.PLACED
      }, {
        include: {
          model: UserModel,
          as: 'user'
        },
        transaction: sequelizeTransaction
      })
      console.log('roller coaster place bet query 3 ended ----------> ', new Date().toISOString())
      // Updating user wallet
      let isPaymentMethodBonus = false
      // deduct from nonCashAmount first
      if (userWallet.nonCashAmount >= betAmount) {
        isPaymentMethodBonus = true
        userWallet.nonCashAmount = minus(userWallet.nonCashAmount, betAmount)
      } else {
        userWallet.amount = minus(userWallet.amount, betAmount)
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      // await HandleBonusWageringService.execute({ userId, userWalletId: userWallet.id, betAmount: +betAmount }, this.context)

      await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.ROLLER_COASTER,
        userWallet,
        betData: rollerCoasterGameBet,
        isPaymentMethodBonus
      }, this.context)

      await UpdateRankingLevelService.execute({ userId }, this.context)

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      console.log('roller coaster place bet service ended ----------> ', new Date().toISOString())

      return rollerCoasterGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

import { divide, minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ajv from '../../../libs/ajv'
import { BET_STATUS, CRYPTO_FUTURES_ROLLERCOASTER_FEE_TYPE, DEFAULT_GAME_ID, PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { roundOf } from '../../../utils/math.utils'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import GameSettingsService from '../common/gameSettings.service'
import UpdateRankingLevelService from '../../bonus/updateRankingLevel.service'

const schema = {
  type: 'object',
  properties: {
    multiplier: { type: 'number' },
    betAmount: { type: 'number' },
    instrumentId: { type: 'number' },
    currencyId: { type: 'number' },
    isBuy: { type: 'boolean' },
    stopLossAmount: { type: 'number' },
    takeProfitAmount: { type: 'number' },
    feeType: { type: 'string' }
  },
  required: ['multiplier', 'betAmount', 'instrumentId', 'currencyId', 'isBuy', 'feeType']
}

const constraints = ajv.compile(schema)

/**
 *
 *
 * @export
 * @class PlaceCryptoFuturesBetService
 * @extends {ServiceBase}
 */
export default class PlaceCryptoFuturesBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { multiplier, betAmount, instrumentId, isBuy, stopLossAmount, currencyId, takeProfitAmount, feeType } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        Transaction: TransactionModel,
        CryptoFuturesBet: CryptoFuturesBetModel,
        CryptoFuturesTickPrice: CryptoFuturesTickPriceModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    const tickPrice = await CryptoFuturesTickPriceModel.findOne({
      where: {
        cryptoFuturesInstrumentId: instrumentId
      },
      order: [['id', 'desc']],
      limit: 1,
      transaction: sequelizeTransaction
    })

    const entryPrice = tickPrice.price

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

    // Fetching user details
    const user = await UserModel.findOne({
      attributes: ['userName'],
      where: {
        id: userId
      },
      include: [{
        model: WalletModel,
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
        as: 'wallets',
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

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    let fee = 0
    if (feeType === CRYPTO_FUTURES_ROLLERCOASTER_FEE_TYPE.FLAT) {
      fee = times(times(multiplier, betAmount), divide(0.040, 100)).toFixed(2)
    }
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null
    userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })
    // const userWallet = await user.wallets[0].reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })
    if (userWallet.amount < (+betAmount + +fee)) {
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
      const cryptoFuturesBet = await CryptoFuturesBetModel.create({
        isBuy,
        feeType,
        betAmount,
        bustPrice,
        multiplier,
        entryPrice,
        stopLossPrice,
        userId: userId,
        takeProfitPrice,
        betStatus: BET_STATUS.PLACED,
        cryptoFuturesInstrumentId: instrumentId
      }, {
        include: {
          model: UserModel,
          as: 'user'
        },
        transaction: sequelizeTransaction
      })

      // Updating user wallet

      let isPaymentMethodBonus = false
      // Updating user wallet
      // deduct from nonCashAmount first
      if (userWallet.nonCashAmount >= betAmount) {
        isPaymentMethodBonus = true
        userWallet.nonCashAmount = minus(userWallet.nonCashAmount, plus(betAmount, fee))
      } else {
        userWallet.amount = minus(userWallet.amount, plus(betAmount, fee))
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      // await HandleBonusWageringService.execute({ userId, userWalletId: userWallet.id, betAmount: +betAmount }, this.context)

      await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES,
        userWallet,
        betData: cryptoFuturesBet
      }, this.context)

      if (feeType === CRYPTO_FUTURES_ROLLERCOASTER_FEE_TYPE.FLAT) {
        await TransactionModel.create({
          actioneeId: userId,
          actioneeType: USER_TYPES.USER,
          sourceWalletId: user.wallets[0].id,
          amount: fee,
          betId: cryptoFuturesBet.id,
          gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES,
          transactionType: TRANSACTION_TYPES.FLAT_FEE,
          success: true,
          paymentMethod: PAYMENT_METHODS.GAME,
          transactionId: `${PAYMENT_METHODS.GAME}-${TRANSACTION_TYPES.FLAT_FEE}-${DEFAULT_GAME_ID.CRYPTO_FUTURES}-${cryptoFuturesBet.id}`,
          status: TRANSACTION_STATUS.SUCCESS,
          isNonCashAmount: isPaymentMethodBonus
        }, { transaction: sequelizeTransaction })
      }
      await UpdateRankingLevelService.execute({ userId }, this.context)
      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      return cryptoFuturesBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

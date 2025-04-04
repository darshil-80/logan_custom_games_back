import { divide, minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ajv from '../../../libs/ajv'
import { BET_RESULT, BET_STATUS, DEFAULT_GAME_ID, PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import CryptoFuturesEmitter from '../../../socket-resources/emitters/cryptoFutures.emitter'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { roundOf } from '../../../utils/math.utils'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import GameSettingsService from '../common/gameSettings.service'

const schema = {
  type: 'object',
  properties: {
    betId: { type: 'number' }
  },
  required: ['betId']
}

const constraints = ajv.compile(schema)

/**
 *
 *
 * @export
 * @class CashOutCryptoFuturesBet
 * @extends {ServiceBase}
 */
export default class CashOutCryptoFuturesBet extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betId } = this.args

    const {
      dbModels: {
        Wallet: WalletModel,
        Currency: CurrencyModel,
        CryptoFuturesBet: CryptoFuturesBetModel,
        CryptoFuturesTickPrice: CryptoFuturesTickPriceModel,
        Transaction: TransactionModel,
        User: UserModel,
        RankingLevel: RankingLevelModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    const cryptoFuturesBet = await CryptoFuturesBetModel.findOne({
      where: { id: betId, userId: userId, result: null, exitPrice: 0 },
      include: [{
        model: TransactionModel,
        required: true,
        as: 'transactions',
        where: {
          transactionType: TRANSACTION_TYPES.BET
        },
        include: [{
          model: WalletModel,
          as: 'sourceWallet',
          required: true,
          include: [{
            attributes: ['code'],
            model: CurrencyModel,
            as: 'currency'
          }]
        }]
      },
      {
        model: UserModel,
        attributes: ['userName'],
        required: true,
        as: 'user',
        include: {
          attributes: ['rank', 'imageLogo', 'moreDetails'],
          model: RankingLevelModel,
          as: 'userRank'
        }
      }],
      lock: {
        level: sequelizeTransaction.LOCK.UPDATE,
        of: CryptoFuturesBetModel
      },
      transaction: sequelizeTransaction
    })

    if (!cryptoFuturesBet) {
      this.addError('NoPlacedBetFoundErrorType', 'no bet found')
      return
    }

    const latestTickPrice = await CryptoFuturesTickPriceModel.findOne({
      where: { cryptoFuturesInstrumentId: cryptoFuturesBet.cryptoFuturesInstrumentId },
      order: [['createdAt', 'desc']]
    })

    const debitTransaction = cryptoFuturesBet.transactions[0]
    const userWallet = await debitTransaction.sourceWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

    const gameSettings = await GameSettingsService.run({ gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES.toString() }, this.context)
    const maxProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    // calculating winning amount
    cryptoFuturesBet.exitPrice = latestTickPrice.price

    let profitPercentage

    if (cryptoFuturesBet.isBuy) {
      profitPercentage = divide(minus(cryptoFuturesBet.exitPrice, cryptoFuturesBet.entryPrice), cryptoFuturesBet.entryPrice)
    } else {
      profitPercentage = divide(minus(cryptoFuturesBet.entryPrice, cryptoFuturesBet.exitPrice), cryptoFuturesBet.entryPrice)
    }

    profitPercentage = plus(1, times(profitPercentage, cryptoFuturesBet.multiplier))

    cryptoFuturesBet.winningAmount = Math.min(times(cryptoFuturesBet.betAmount, profitPercentage), plus(cryptoFuturesBet.betAmount, maxProfit.amount))
    cryptoFuturesBet.winningAmount = roundOf(Math.max(0, cryptoFuturesBet.winningAmount), 2)

    cryptoFuturesBet.result = BET_RESULT.WON
    cryptoFuturesBet.betStatus = BET_STATUS.CASHED_OUT
    // create credit transaction

    try {
      await cryptoFuturesBet.save({
        transaction: sequelizeTransaction
      })

      // Calculate fee if pnl is set
      let fee = 0
      if (cryptoFuturesBet.feeType === 'pnl' && (+cryptoFuturesBet.winningAmount > +cryptoFuturesBet.betAmount)) {
        // 5% fee on profit
        fee = times(minus(cryptoFuturesBet.winningAmount, cryptoFuturesBet.betAmount), divide(5, 100))
        // Create debit transaction for fees deduction
        await TransactionModel.create({
          actioneeId: cryptoFuturesBet.userId,
          actioneeType: USER_TYPES.USER,
          sourceWalletId: userWallet.id,
          amount: fee,
          betId: cryptoFuturesBet.id,
          gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES,
          transactionType: TRANSACTION_TYPES.PNL_FEE,
          success: true,
          paymentMethod: PAYMENT_METHODS.GAME,
          transactionId: `${PAYMENT_METHODS.GAME}-${TRANSACTION_TYPES.PNL_FEE}-${DEFAULT_GAME_ID.CRYPTO_FUTURES}-${cryptoFuturesBet.id}`,
          status: TRANSACTION_STATUS.SUCCESS
        }, { transaction: sequelizeTransaction })
      }

      cryptoFuturesBet.winningAmount = minus(cryptoFuturesBet.winningAmount, fee)

      // Updating user wallet
      userWallet.amount = plus(userWallet.amount, cryptoFuturesBet.winningAmount)
      await userWallet.save({ transaction: sequelizeTransaction })

      await CreateCreditTransactionService.execute({ gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES, userWallet, betData: cryptoFuturesBet, debitTransaction }, this.context)
      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      delete cryptoFuturesBet.dataValues.transactions
      cryptoFuturesBet.dataValues.roi = ((cryptoFuturesBet.winningAmount - cryptoFuturesBet.betAmount) / cryptoFuturesBet.betAmount) * 100
      CryptoFuturesEmitter.emitCryptoFuturesClosedBets(cryptoFuturesBet)

      return cryptoFuturesBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

import { divide, minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ajv from '../../../libs/ajv'
import { BET_RESULT, BET_STATUS, DEFAULT_GAME_ID, PAYMENT_METHODS, ROLLER_COASTER_GAME_STATE, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import RollerCoasterEmitter from '../../../socket-resources/emitters/rollerCoasterGame.emitter'
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
 * @class RollerCoasterGameCashOutBetService
 * @extends {ServiceBase}
 */
export default class RollerCoasterGameCashOutBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betId } = this.args

    const {
      dbModels: {
        Wallet: WalletModel,
        Currency: CurrencyModel,
        RollerCoasterGameBet: RollerCoasterGameBetModel,
        RollerCoasterGameRoundDetail: RollerCoasterGameRoundDetailModel,
        RollerCoasterGameTickPrice: RollerCoasterGameTickPriceModel,
        Transaction: TransactionModel,
        User: UserModel,
        RankingLevel: RankingLevelModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    const rollerCoasterGameBet = await RollerCoasterGameBetModel.findOne({
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
          lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
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
        of: RollerCoasterGameBetModel
      },
      transaction: sequelizeTransaction
    })

    if (!rollerCoasterGameBet) {
      this.addError('NoPlacedBetFoundErrorType', 'no bet found')
      return
    }

    const currentRound = await RollerCoasterGameRoundDetailModel.findOne({
      where: {
        roundState: ROLLER_COASTER_GAME_STATE.STARTED,
        roundId: rollerCoasterGameBet.roundId
      },
      include: {
        model: RollerCoasterGameTickPriceModel,
        as: 'tickers',
        order: [['id', 'desc']],
        limit: 1,
        required: true
      }
    })

    if (!currentRound) {
      this.addError('NoRoundRunningErrorType', 'round is not running')
      return
    }

    const debitTransaction = rollerCoasterGameBet.transactions[0]
    const userWallet = await debitTransaction.sourceWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

    const gameSettings = await GameSettingsService.run({ gameId: DEFAULT_GAME_ID.ROLLER_COASTER.toString() }, this.context)
    const maxProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    // calculating winning amount
    rollerCoasterGameBet.exitPrice = currentRound.tickers[0].currentPrice

    let profitPercentage

    if (rollerCoasterGameBet.isBuy) {
      profitPercentage = divide(minus(rollerCoasterGameBet.exitPrice, rollerCoasterGameBet.entryPrice), rollerCoasterGameBet.entryPrice)
    } else {
      profitPercentage = divide(minus(rollerCoasterGameBet.entryPrice, rollerCoasterGameBet.exitPrice), rollerCoasterGameBet.entryPrice)
    }

    profitPercentage = plus(1, times(profitPercentage, rollerCoasterGameBet.multiplier))

    rollerCoasterGameBet.winningAmount = Math.min(times(rollerCoasterGameBet.betAmount, profitPercentage), plus(rollerCoasterGameBet.betAmount, maxProfit.amount))
    rollerCoasterGameBet.winningAmount = roundOf(Math.max(0, rollerCoasterGameBet.winningAmount), 2)

    rollerCoasterGameBet.result = BET_RESULT.WON
    rollerCoasterGameBet.betStatus = BET_STATUS.CASHED_OUT
    // create credit transaction

    try {
      let fee = 0
      if (+rollerCoasterGameBet.winningAmount > +rollerCoasterGameBet.betAmount) {
        // 5% fee on profit
        fee = times(minus(rollerCoasterGameBet.winningAmount, rollerCoasterGameBet.betAmount), divide(5, 100))
        await TransactionModel.create({
          actioneeId: rollerCoasterGameBet.userId,
          actioneeType: USER_TYPES.USER,
          sourceWalletId: userWallet.id,
          amount: fee,
          betId: rollerCoasterGameBet.id,
          gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES,
          transactionType: TRANSACTION_TYPES.FEE,
          success: true,
          paymentMethod: PAYMENT_METHODS.GAME,
          transactionId: `${PAYMENT_METHODS.GAME}-${TRANSACTION_TYPES.FEE}-${DEFAULT_GAME_ID.ROLLER_COASTER}-${rollerCoasterGameBet.id}`,
          status: TRANSACTION_STATUS.SUCCESS
        }, { transaction: sequelizeTransaction })
      }

      rollerCoasterGameBet.winningAmount = roundOf(Math.max(0, minus(rollerCoasterGameBet.winningAmount, fee)), 2)

      await rollerCoasterGameBet.save({
        transaction: sequelizeTransaction
      })

      // Updating user wallet
      userWallet.amount = plus(userWallet.amount, rollerCoasterGameBet.winningAmount)

      await userWallet.save({ transaction: sequelizeTransaction })
      await CreateCreditTransactionService.execute({ gameId: DEFAULT_GAME_ID.ROLLER_COASTER, userWallet, betData: rollerCoasterGameBet, debitTransaction }, this.context)

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      delete rollerCoasterGameBet.transactions
      rollerCoasterGameBet.dataValues.roi = ((rollerCoasterGameBet.winningAmount - rollerCoasterGameBet.betAmount) / rollerCoasterGameBet.betAmount) * 100
      RollerCoasterEmitter.emitRollerCoasterClosedBet(rollerCoasterGameBet?.toJSON())

      return rollerCoasterGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

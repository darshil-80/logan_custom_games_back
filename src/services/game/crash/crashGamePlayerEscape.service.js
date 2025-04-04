import moment from 'moment'
import ServiceBase from '../../../libs/serviceBase'
import { minus, plus, times } from 'number-precision'
import GameSettingsService from '../common/gameSettings.service'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import CrashGameGetMultiplierByGraphTimeService from './crashGameGetMultiplierByGraphTime.service'
import { CRASH_GAME_STATE, DEFAULT_GAME_ID, BET_RESULT, TRANSACTION_TYPES } from '../../../libs/constants'

/**
 *
 *
 * @export
 * @class CrashGamePlayerEscapeService
 * @extends {ServiceBase}
 */
export default class CrashGamePlayerEscapeService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        Wallet: WalletModel,
        Currency: CurrencyModel,
        Transaction: TransactionModel,
        CrashGameBet: CrashGameBetModel,
        CrashGameRoundDetail: CrashGameRoundDetailModel
      },
      reqTimeStamp,
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const currentRound = await CrashGameRoundDetailModel.findOne({
      where: {
        roundState: CRASH_GAME_STATE.ON_HOLD
      }
    })

    if (!currentRound) {
      this.addError('NoRoundRunningErrorType', 'round is not running')
      return
    }

    const crashGameBet = await CrashGameBetModel.findOne({
      where: {
        userId: userId,
        result: null,
        winningAmount: '0',
        escapeRate: 0,
        roundId: currentRound.roundId
      },
      include: [{
        model: TransactionModel,
        as: 'transactions',
        where: {
          transactionType: TRANSACTION_TYPES.BET
        },
        include: [{
          model: WalletModel,
          as: 'sourceWallet',
          lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
          include: [{
            attributes: ['code'],
            model: CurrencyModel,
            as: 'currency'
          }]
        }],
        required: false
      }, {
        model: CurrencyModel,
        as: 'currency'
      }],
      lock: {
        level: sequelizeTransaction.LOCK.UPDATE,
        of: CrashGameBetModel
      },
      skipLocked: true,
      transaction: sequelizeTransaction
    })

    if (!crashGameBet) {
      this.addError('NoPlacedBetFoundErrorType', 'no bet found')
      return
    }

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.CRASH.toString() }, this.context)).result

    const startTime = moment(currentRound.onHoldAt)
    const escapeTime = moment(reqTimeStamp)
    const timeDiff = escapeTime.diff(startTime)

    const multiplier = await CrashGameGetMultiplierByGraphTimeService.run({ time: timeDiff / 1000 }, this.context)

    if (+multiplier > +currentRound.crashRate) {
      this.addError('NoRoundRunningErrorType', 'round is not running')
      return
    }

    crashGameBet.escapeRate = multiplier
    crashGameBet.result = BET_RESULT.WON
    crashGameBet.winningAmount = times(multiplier, crashGameBet.betAmount)

    const debitTransaction = crashGameBet.transactions[0]
    const maxBetProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === debitTransaction.sourceWallet.currency.code)[0]

    const profit = minus(crashGameBet.winningAmount, crashGameBet.betAmount)

    if (profit > maxBetProfit.amount) {
      crashGameBet.winningAmount = plus(crashGameBet.betAmount, maxBetProfit.amount)
    }

    const userWallet = debitTransaction.sourceWallet
    await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })
    userWallet.amount = plus(userWallet.amount, crashGameBet.winningAmount)
    await userWallet.save({ transaction: sequelizeTransaction })
    await CreateCreditTransactionService.execute({ gameId: DEFAULT_GAME_ID.CRASH, userWallet, betData: crashGameBet, debitTransaction }, this.context)

    WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
    await crashGameBet.save({ transaction: sequelizeTransaction })

    return crashGameBet
  }
}

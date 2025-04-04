import { plus } from 'number-precision'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { CRASH_GAME_STATE, DEFAULT_GAME_ID, BET_RESULT, TRANSACTION_TYPES } from '../../../libs/constants'
import CreateRollbackTransactionService from '../common/createRollbackTransaction.service'

/**
 *
 *
 * @export
 * @class CrashGameCancelBetService
 * @extends {ServiceBase}
 */
export default class CrashGameCancelBetService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        Transaction: TransactionModel,
        CrashGameBet: CrashGameBetModel,
        Wallet: WalletModel,
        CrashGameRoundDetail: CrashGameRoundDetailModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const currentRound = await CrashGameRoundDetailModel.findOne({
      where: {
        roundState: CRASH_GAME_STATE.STARTED
      }
    })

    if (!currentRound) {
      this.addError('NoRoundRunningErrorType', 'no round is running')
      return
    }

    const alreadyPlacedBet = await CrashGameBetModel.findOne({
      where: {
        userId: userId,
        result: null,
        roundId: currentRound.roundId
      },
      include: {
        model: TransactionModel,
        as: 'transactions',
        where: {
          transactionType: TRANSACTION_TYPES.BET
        },
        include: ['sourceWallet'],
        required: false
      },
      lock: {
        level: sequelizeTransaction.LOCK.UPDATE,
        of: CrashGameBetModel
      },
      skipLocked: true,
      transaction: sequelizeTransaction
    })

    if (!alreadyPlacedBet) {
      this.addError('NoPlacedBetFoundErrorType', 'no bet found')
      return
    }

    const transactionDetail = alreadyPlacedBet.transactions[0]

    const betAmount = alreadyPlacedBet.betAmount

    const userWallet = transactionDetail.sourceWallet
    await CreateRollbackTransactionService.execute({ debitTransaction: transactionDetail, userWallet, gameId: DEFAULT_GAME_ID.CRASH, betData: alreadyPlacedBet }, this.context)

    await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

    // if (transactionDetail.paymentMethod === PAYMENT_METHODS.GAME) {
    userWallet.amount = plus(userWallet.amount, betAmount)
    // } else {
    //   userWallet.nonCashAmount = plus(userWallet.nonCashAmount, betAmount)
    // }

    await userWallet.save({ transaction: sequelizeTransaction })

    WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

    alreadyPlacedBet.result = BET_RESULT.CANCELLED
    await alreadyPlacedBet.save({ transaction: sequelizeTransaction })

    return currentRound.roundId
  }
}

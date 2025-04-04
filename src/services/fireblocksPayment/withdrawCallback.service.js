import { plus } from 'number-precision'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import { TRANSACTION_STATUS } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    txnId: { type: 'string' },
    amount: { type: 'string' },
    amountUSD: { type: 'string' },
    currency: { type: 'string' },
    address: { type: 'string' },
    status: { type: 'string' }
  },
  required: []
}

const constraints = ajv.compile(schema)

/**
 * Provides the service to the coin payment withdrawal callback
 * @export
 * @class WithdrawalCallbackService
 * @extends {ServiceBase}
 */
export default class WithdrawalCallbackService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { Wallet: WalletModel, PaymentTransaction: PaymentTransactionModel },
      sequelizeTransaction
    } = this.context
    const {
      txnId,
      amountUSD,
      status: withdrawStatus
    } = this.args

    if (txnId) {
      if (withdrawStatus === 'failed') {
        const transaction = await PaymentTransactionModel.findOne({
          where: { coinPaymentTxnId: txnId },
          transaction: sequelizeTransaction
        })

        if (!transaction) {
          return
        }

        await PaymentTransactionModel.update(
          { status: TRANSACTION_STATUS.FAILED },
          {
            where: { coinPaymentTxnId: txnId },
            transaction: sequelizeTransaction
          }
        )

        const walletInfo = await WalletModel.findOne({
          lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
          where: { id: transaction.targetWalletId },
          transaction: sequelizeTransaction
        })

        if (!walletInfo) {
          return this.addError('Withdraw callback failed', 'User wallet not found')
        }

        walletInfo.amount = plus(walletInfo.amount, amountUSD)
        walletInfo.save({ transaction: sequelizeTransaction })

        WalletEmitter.emitUserWalletBalance(walletInfo?.toJSON(), walletInfo.ownerId)
      } else {
        await PaymentTransactionModel.update(
          { status: TRANSACTION_STATUS.SUCCESS },
          {
            where: { coinPaymentTxnId: txnId },
            transaction: sequelizeTransaction
          }
        )
      }
    }

    return { message: 'Transaction completed successfully', status: 200 }
  }
}

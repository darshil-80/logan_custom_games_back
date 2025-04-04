import {
  TRANSACTION_STATUS
} from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import DepositCallback from './depositCallback.service'
import WithdrawalCallbackService from './withdrawCallback.service'

export default class FireBlocksCallBackService extends ServiceBase {
  async run () {
    const {
      data: {
        sourceAddress,
        destinationAddress: address,
        netAmount: paidAmount,
        feeCurrency: currency,
        operation: transactionType,
        subStatus: status,
        txHash: txnId,
        amountUSD
      }
    } = this.args

    const callbackAmount = parseFloat(paidAmount)
    try {
      if (txnId && transactionType === 'TRANSFER' && sourceAddress) { // i.e. it is a deposit
        let transactionStatus = TRANSACTION_STATUS.PENDING
        if (status === 'CONFIRMED') transactionStatus = TRANSACTION_STATUS.SUCCESS
        else if (status === 'FAILED') transactionStatus = TRANSACTION_STATUS.FAILED
        await DepositCallback.run({
          amountUSD,
          txn_id: txnId,
          address: address,
          currency: currency,
          callbackAddress: sourceAddress,
          amount: callbackAmount,
          status: transactionStatus
        }, this.context)
      } else if ((txnId && transactionType === 'WITHDRAW')) { // i.e. it is a withdraw
        let transactionStatus = TRANSACTION_STATUS.PENDING
        if (status === 'CONFIRMED') transactionStatus = TRANSACTION_STATUS.SUCCESS
        else if (status === 'FAILED') transactionStatus = TRANSACTION_STATUS.FAILED
        await WithdrawalCallbackService.run({
          amountUSD,
          txn_id: txnId,
          address: address,
          currency: currency,
          amount: callbackAmount,
          status: transactionStatus
        }, this.context)
      }
      return { success: true }
    } catch (error) {
      return this.addError('Transaction callback failed', 'Transaction callback failed')
    }
  }
}

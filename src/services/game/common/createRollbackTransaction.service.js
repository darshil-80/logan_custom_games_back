import APIError from '../../../errors/api.error'
import { PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
// const constraints = {
//   gameId: {
//     type: 'number'
//   },
//   userWallet: {
//     type: 'object'
//   },
//   betData: {
//     type: 'object'
//   },
//   debitTransaction: {
//     type: 'object'
//   }
// }

/**
 * @export
 * @class CreateRollbackTransactionService
 * @extends {ServiceBase}
 */
export default class CreateRollbackTransactionService extends ServiceBase {
  // get constraints () {
  //   return constraints
  // }

  async run () {
    const {
      dbModels: {
        Transaction: TransactionModel
      },
      sequelizeTransaction
    } = this.context

    const {
      betData,
      gameId,
      userWallet,
      debitTransaction
    } = this.args

    let transactionData

    try {
      // Creating credit transaction entry for bet
      transactionData = await TransactionModel.create({
        actioneeId: betData.userId,
        actioneeType: USER_TYPES.USER,
        targetWalletId: userWallet.id,
        amount: +betData.betAmount,
        betId: betData.id,
        gameId,
        transactionType: TRANSACTION_TYPES.ROLLBACK,
        success: true,
        paymentMethod: PAYMENT_METHODS.GAME,
        transactionId: `${PAYMENT_METHODS.GAME}-${TRANSACTION_TYPES.ROLLBACK}-${gameId}-${betData.id}`,
        debitTransactionId: debitTransaction.transactionId,
        status: TRANSACTION_STATUS.SUCCESS
      }, { transaction: sequelizeTransaction })
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }

    return transactionData
  }
}

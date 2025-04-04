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
//   }
// }

/**
 * @export
 * @class CreateDebitTransactionService
 * @extends {ServiceBase}
 */
export default class CreateDebitTransactionService extends ServiceBase {
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
      isPaymentMethodBonus
    } = this.args

    let debitTransactionData
    const paymentMethod = isPaymentMethodBonus ? PAYMENT_METHODS.BONUS : PAYMENT_METHODS.GAME
    try {
      // Creating debit transaction entry for bet
      debitTransactionData = await TransactionModel.create({
        actioneeId: betData.userId,
        actioneeType: USER_TYPES.USER,
        sourceWalletId: userWallet.id,
        amount: +betData.betAmount,
        betId: betData.id,
        gameId,
        transactionType: TRANSACTION_TYPES.BET,
        success: true,
        paymentMethod: paymentMethod,
        transactionId: `${paymentMethod}-${TRANSACTION_TYPES.BET}-${gameId}-${betData.id}`,
        status: TRANSACTION_STATUS.SUCCESS,
        isNonCashAmount: isPaymentMethodBonus
      }, { transaction: sequelizeTransaction })
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }

    return debitTransactionData
  }
}

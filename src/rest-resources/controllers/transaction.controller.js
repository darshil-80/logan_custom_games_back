import { sendResponse } from '../../helpers/response.helpers'
import GetCoinPaymentTransactionService from '../../services/transactions/getCoinPaymentTransaction.service'
import GetTransactionInfoService from '../../services/transactions/getTransactionInfo.service'
import GetUserTransactionsService from '../../services/transactions/getUserTransaction.service'

/**
 * Transaction Controller for handling all the request of /transaction path
 *
 * @export
 * @class TransactionController
 */

export default class TransactionController {
  /**
   * Controller method to handle the request for fetch Banner of tenant
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof TransactionController
   */

  static async getCoinPaymentTransactions (req, res, next) {
    try {
      const { result, successful, errors } = await GetCoinPaymentTransactionService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getTransactionsInfo (req, res, next) {
    try {
      const { result, successful, errors } = await GetTransactionInfoService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getUserTransactions (req, res, next) {
    try {
      const { result, successful, errors } = await GetUserTransactionsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

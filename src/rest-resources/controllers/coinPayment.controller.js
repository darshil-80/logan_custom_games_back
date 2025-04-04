import DepositCallbackService from '../../services/coinPayment/depositCallback.service'
import WithdrawalCallbackService from '../../services/coinPayment/withdrawalCallback.service'
import { sendResponse } from '../../helpers/response.helpers'

/**
 * coinPayments Controller for handling all the request of /coin-payment
 *
 * @export
 * @class CoinPayment
 */
export default class CoinPayment {
  /**
   * Controller method to handle the request for /deposit-callback
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof CoinPayment
   */
  static async depositCallback (req, res, next) {
    try {
      const { result, successful, errors } = await DepositCallbackService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /withdraw-callback
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof CoinPayment
   */
  static async withdrawCallback (req, res, next) {
    try {
      const { result, successful, errors } = await WithdrawalCallbackService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

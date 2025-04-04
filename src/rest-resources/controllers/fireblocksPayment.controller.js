import DepositCallbackService from '../../services/fireblocksPayment/fireBlocksCallBack.service'
import WithdrawalCallbackService from '../../services/fireblocksPayment/withdrawCallback.service'
import { sendResponse } from '../../helpers/response.helpers'

/**
 * FireblocksPayment Controller for handling all the request of /fireblocks
 *
 * @export
 * @class FireblocksPayment
 */
export default class FireblocksPayment {
  /**
   * Controller method to handle the request for /deposit-callback
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof FireblocksPayment
   */
  static async callback (req, res, next) {
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
   * @memberof FireblocksPayment
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

import { sendResponse } from '../../helpers/response.helpers'
import MoonpayCallBackService from '../../services/moonpay/moonpayBuyCallbackService'
import CreateMoonpaySignature from '../../services/moonpay/moonpaySignupService'

/**
 * moonpay Controller for handling all the request of /coin-payment
 *
 * @export
 * @class MoonpayController
 */
export default class MoonpayController {
  /**
   * Controller method to handle the request for /moonpay
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof MoonpayController
   */
  static async createSignature (req, res, next) {
    try {
      const { result, successful, errors } = await CreateMoonpaySignature.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

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
      const { result, successful, errors } = await MoonpayCallBackService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

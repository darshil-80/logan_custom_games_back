import { sendResponse } from '../../helpers/response.helpers'
import WithdrawService from '../../services/fireblocksPayment/withdraw.service'
import GenerateAddressService from '../../services/wallet/generateAddress.service'
import GogopayCreateDepositService from '../../services/wallet/gogopayCreateDeposit.service'
import GogopayCreateWithdrawService from '../../services/wallet/gogopayCreateWithdraw.service'
import GetGogopayDepositStatusService from '../../services/wallet/gogopayDepositStatus.service'
import GetGogopayWithdrawStatusService from '../../services/wallet/gogopayWithdrawStatus.service'

/**
 * Wallet Controller for handling all the request of /wallet path
 *
 * @export
 * @class WalletController
 */
export default class WalletController {
  /**
   * Controller method to handle the request for /deposit-amount path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof WallerController
   */
  static async gogopayCreateDeposit (req, res, next) {
    try {
      const { result, successful, errors } = await GogopayCreateDepositService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /withdraw-amount path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof WallerController
   */
  static async gogopayCreateWithdraw (req, res, next) {
    try {
      const { result, successful, errors } = await GogopayCreateWithdrawService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /deposit-status path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof WallerController
   */
  static async depositStatus (req, res, next) {
    try {
      const { result, successful, errors } = await GetGogopayDepositStatusService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /withdraw-status path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof WallerController
   */
  static async withdrawStatus (req, res, next) {
    try {
      const { result, successful, errors } = await GetGogopayWithdrawStatusService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /generate-address path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof WallerController
   */
  static async generateAddress (req, res, next) {
    try {
      const { result, successful, errors } = await GenerateAddressService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /withdraw-request path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof WallerController
   */
  static async withdrawRequest (req, res, next) {
    try {
      const { result, successful, errors } = await WithdrawService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

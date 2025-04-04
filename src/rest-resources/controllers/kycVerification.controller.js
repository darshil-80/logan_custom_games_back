import { sendResponse } from '../../helpers/response.helpers'
import CreateAccessToken from '../../services/kycVerification/initKyc.service'
import UpdateKycMethodService from '../../services/kycVerification/updateKycStatus.service'
import UpdateUserKycService from '../../services/kycVerification/updateUserKycDetails.service'

/**
 * kyc Verification Controller for handling all the request of /kyc-verification path
 *
 * @export
 * @class KycVerification
 */
export default class KycVerificationController {
  /**
   * Controller method to handle the request for /init-token path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof KycVerificationController
   */
  static async initAccessToken (req, res, next) {
    try {
      const { result, successful, errors } = await CreateAccessToken.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for update sumsub kyc status for user
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof KycVerificationController
   */
  static async updateSumSubStatus (req, res, next) {
    try {
      const { result, successful, errors } = await UpdateKycMethodService.execute({ payload: req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * It is responsible for updating the user's kyc of the authenticated user
    * @static
    * @param {object} req - object contains all the request params sent from the client
    * @param {object} res - object contains all the response params sent to the client
    * @param {function} next - function to execute next middleware
    * @memberof KycVerificationController
   */
  static async updateUserKyc (req, res, next) {
    try {
      const { result, successful, errors } = await UpdateUserKycService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

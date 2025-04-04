import { sendResponse } from '../../helpers/response.helpers'
import GetAllBonusesService from '../../services/bonus/getAllBonus.service'
import GetUserBonusDetailsService from '../../services/bonus/getUserBonusDetails.service'
import ClaimUserBonusAmountService from '../../services/bonus/claimBonus.service'
import GetUserAllRewardsDetailsService from '../../services/bonus/getUserAllRewardsDetails.service'
import GetAllRankDetailsService from '../../services/bonus/getAllRankDetails.service'
import GetSplitBonusService from '../../services/bonus/getSplitBonus.service'
import ClaimAllUserBonusAmountService from '../../services/bonus/claimAllBonus.service'
import GetUserAllClaimableBonusService from '../../services/bonus/getAllClaimableUserBonus.service'
import GetDailyBonusDetailsService from '../../services/bonus/getActiveDailyBonus.service'
import ActivateBonusWageringService from '../../services/bonus/activateBonusWagering.service'

/**
 * Bonus Controller for handling all the request of /bonus path
 *
 * @export
 * @class BonusController
 */
export default class BonusController {
  /**
* Controller method to handle the request for /list path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async getAllBonuses (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllBonusesService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to handle the request for /list-user-bonus path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async getUserBonusDetails (req, res, next) {
    try {
      const { result, successful, errors } = await GetUserBonusDetailsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to handle the request for /claim-daily-bonus-amount path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async claimUserBonusAmount (req, res, next) {
    try {
      const { result, successful, errors } = await ClaimUserBonusAmountService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to handle the request for /daily-bonus-amount path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async DailyBonusDetails (req, res, next) {
    try {
      const { result, successful, errors } = await GetDailyBonusDetailsService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /active-bonus path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof BonusController
   */
  static async getUserAllRewardsDetails (req, res, next) {
    try {
      const { result, successful, errors } = await GetUserAllRewardsDetailsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /active-bonus path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof BonusController
   */
  static async GetAllRankDetails (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllRankDetailsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async GetSplitBonus (req, res, next) {
    try {
      const { result, successful, errors } = await GetSplitBonusService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to handle the request for /claim-all-bonus-amount path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async claimAllUserBonusAmount (req, res, next) {
    try {
      const { result, successful, errors } = await ClaimAllUserBonusAmountService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to handle the request for /list path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async getAllClaimableBonuses (req, res, next) {
    try {
      const { result, successful, errors } = await GetUserAllClaimableBonusService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to handle the request for /activate-wagering path
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof BonusController
*/
  static async activateWagering (req, res, next) {
    try {
      const { result, successful, errors } = await ActivateBonusWageringService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

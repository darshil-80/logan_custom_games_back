import { sendResponse } from '../../helpers/response.helpers'
import GetUserDetailService from '../../services/user/getUserDetail.service'

/**
 * User Controller for handling all the request of /user path
 *
 * @export
 * @class UserController
 */
export default class UserController {
  /**
   * This resolver is responsible to fetch current logged in user's detail
    * @static
    * @param {object} req - object contains all the request params sent from the client
    * @param {object} res - object contains all the response params sent to the client
    * @param {function} next - function to execute next middleware
    * @memberof UserController
   */
  static async getUserDetail (req, res, next) {
    try {
      const { result, successful, errors } = await GetUserDetailService.execute({userId: req.headers.userid}, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

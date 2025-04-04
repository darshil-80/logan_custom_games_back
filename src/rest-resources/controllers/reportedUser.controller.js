import { sendResponse } from '../../helpers/response.helpers'
import GetReportedUserService from '../../services/reportedUser/getReportedUser.service'
import CreateReportedUserService from '../../services/reportedUser/createReportedUser.service'
import UpdateReportedUserService from '../../services/reportedUser/updateReportedUser.service'

/**
 * ReportedUser Controller for handling all the request of /ReportedUser path
 *
 * @export
 * @class ReportedUserController
 */
export default class ReportedUserController {
  /**
   * Controller method for ReportedUser
   *
   * @static
   * @param {object} req - object contains all the request body sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof reportedUserController
   */

  static async getReportedUser (req, res, next) {
    try {
      const { result, successful, errors } = await GetReportedUserService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async createReportedUser (req, res, next) {
    try {
      const { result, successful, errors } = await CreateReportedUserService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async updateReportedUser (req, res, next) {
    try {
      const { result, successful, errors } = await UpdateReportedUserService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

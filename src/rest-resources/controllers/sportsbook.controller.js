import { sendResponse } from '../../helpers/response.helpers'
import GetAllSportsbookTransactionsService from '../../services/sportsbook/getAllSportsbookTransactions.service'

/**
 * Sportsbook Controller for handling all the request of /sportsbook path
 *
 * @export
 * @class SportsbookController
 */
export default class SportsbookController {
  /**
   * Controller method to handle the request for /all-sportbook transaction
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof SportsbookController
   */
  static async getAllSportsbookTransaction (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllSportsbookTransactionsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

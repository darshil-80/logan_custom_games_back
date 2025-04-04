import { sendResponse } from '../../helpers/response.helpers'
import GetAllSponsorService from '../../services/sponsors/getAllSponsors.service'

/**
 * Sponsor Controller for handling all the request of /sponsor path
 *
 * @export
 * @class SponsorController
 */
export default class SponsorController {
  /**
   * Controller method to handle the request for /list path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof SponsorController
   */
  static async getAllSponsors (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllSponsorService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

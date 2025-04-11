import { sendResponse } from '../../helpers/response.helpers'
import GetGameSettingsService from '../../services/system/getGameSettings.service'

/**
 * System Controller for handling all the request of /system path
 *
 * @export
 * @class SystemController
 */
export default class SystemController {
  /**
   * Controller method to handle the request for fetch enabled games of a tenant
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof SystemController
   */
  static async getGameSettings (req, res, next) {
    try {
      const { result, successful, errors } = await GetGameSettingsService.execute({}, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

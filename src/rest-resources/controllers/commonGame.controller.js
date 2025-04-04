import { sendResponse } from '../../helpers/response.helpers'
import AddCustomFavoriteGameService from '../../services/game/common/addCustomFavouriteGame.service'
import GameSettingsService from '../../services/game/common/gameSettings.service'
import GetCustomFavoriteGameService from '../../services/game/common/getAllCustomFavouriteGame.service'
import RemoveCustomFavoriteGameService from '../../services/game/common/removeCustomFavouriteGame.service'

/**
 * Game Controller for handling all the request of /common-game path
 *
 * @export
 * @class CommonGameController
 */
export default class CommonGameController {
  /**
* Controller method will provide, game setting for a particular game.
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof CommonGameController
*/
  static async gameSettings (req, res, next) {
    try {
      const { result, successful, errors } = await GameSettingsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to add Custom Favourite Games
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof SystemController
*/
  static async addCustomFavoriteGame (req, res, next) {
    try {
      const { result, successful, errors } = await AddCustomFavoriteGameService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to remove Custom Favourite Games
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof SystemController
*/
  static async removeCustomFavoriteGame (req, res, next) {
    try {
      const { result, successful, errors } = await RemoveCustomFavoriteGameService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to get all Custom Favourite Games
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof SystemController
*/
  static async getCustomFavoriteGame (req, res, next) {
    try {
      const { result, successful, errors } = await GetCustomFavoriteGameService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

import { sendResponse } from '../../helpers/response.helpers'
import AddFavoriteGameService from '../../services/casino/addFavouriteGames'
import GetFavoriteGameService from '../../services/casino/getAllFavouriteGame.service'
import GetAllCasinoTransactionsService from '../../services/casino/getAllCasinoTransaction.service'
import RemoveFavoriteGameService from '../../services/casino/removeFavouriteGame.service'
import GetAllCasinoGamesService from '../../services/casino/getAllCasinoGames.service'
import GetAllCasinoProvidersService from '../../services/casino/getAllCasinoProviders.service'
import GetAllCasinoCategoryService from '../../services/casino/getAllCasinoCategory.service'
import GetAllHighRollerBetsService from '../../services/casino/getHighRollerBets.service'
import GetCasinoGameService from '../../services/casino/getCasinoGame.service'

/**
 * Casino Controller for handling all the request of /casino path
 *
 * @export
 * @class CasinoController
 */
export default class CasinoController {
  /**
  * Controller method to add Favourite Games
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async addFavoriteGame (req, res, next) {
    try {
      const { result, successful, errors } = await AddFavoriteGameService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to remove Favourite Games
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async removeFavoriteGame (req, res, next) {
    try {
      const { result, successful, errors } = await RemoveFavoriteGameService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to get all Favourite Games
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getFavoriteGame (req, res, next) {
    try {
      const { result, successful, errors } = await GetFavoriteGameService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to list all casino transaction
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getAllCasinoTransaction (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllCasinoTransactionsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to list casino games
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getAllCasinoGames (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllCasinoGamesService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to get casino game
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getCasinoGame (req, res, next) {
    try {
      const { result, successful, errors } = await GetCasinoGameService.execute({...req.params, ...req.query}, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to list casino providers
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getAllCasinoProviders (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllCasinoProvidersService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to list all category from smartsoft game
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getAllCasinoGamesCategory (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllCasinoCategoryService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to list all get All High Roller Bets
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CasinoController
  */
  static async getAllHighRollerBets (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllHighRollerBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

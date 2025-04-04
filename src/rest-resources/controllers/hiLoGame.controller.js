import { sendResponse } from '../../helpers/response.helpers'
import HiLoGamePlaceBetService from '../../services/game/hi-lo/hiLoGamePlaceBet.service'
import GetHiLoGameMyBetsService from '../../services/game/hi-lo/getHiLoGameMyBets.service'
import HiLoGameCashOutBetService from '../../services/game/hi-lo/hiLoGameCashOutBet.service'
import HiLoGameOpenCardService from '../../services/game/hi-lo/hiLoGameOpenCard.service'
import GetUnfinishedBetService from '../../services/game/hi-lo/getUnfinishedBet.service'
import HiloGameCheckProvableFairService from '../../services/game/hi-lo/hiLoGameCheckProvableFair.service'

/**
 * HiLoGame Controller for handling all the request of /hi-lo-game path
 *
 * @export
 * @class HiLoGameController
 */
export default class HiLoGameController {
  /**
   * Controller method to handle the request for /place-bet path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof HiLoGameController
   */
  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await HiLoGamePlaceBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /cash-out path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof HiLoGameController
   */
  static async cashOutBet (req, res, next) {
    try {
      const { result, successful, errors } = await HiLoGameCashOutBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /open-card path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof HiLoGameController
   */
  static async openCard (req, res, next) {
    try {
      const { result, successful, errors } = await HiLoGameOpenCardService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /my-bets path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof HiLoGameController
   */
  static async getMyBets (req, res, next) {
    try {
      const { result, successful, errors } = await GetHiLoGameMyBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /my-bets path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof HiLoGameController
   */
  static async currentBetState (req, res, next) {
    try {
      const { result, successful, errors } = await GetUnfinishedBetService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller method to handle the request for /check-fairness path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof HiLoGameController
   */
  static async checkFairness (req, res, next) {
    try {
      const { result, successful, errors } = await HiloGameCheckProvableFairService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

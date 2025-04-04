import { sendResponse } from '../../helpers/response.helpers'
import FlipCoinGameCheckProvableFairService from '../../services/game/flip-coin/flipCoinGameCheckProvableFair.service'
import GetFlipCoinGameMyBetsService from '../../services/game/flip-coin/flipCoinGameMyBets.service'
import FlipCoinGamePlaceBetService from '../../services/game/flip-coin/flipCoinGamePlaceBet.service'

/**
 * FlipCoinGame Controller for handling all the request of /flip-coin-game path
 *
 * @export
 * @class FlipCoinGameController
 */
export default class FlipCoinGameController {
  /**
   * Controller method to handle the request for /place-bet path
   *
   * @static
   * @param {object} req - object contains all the request params sent from the client
   * @param {object} res - object contains all the response params sent to the client
   * @param {function} next - function to execute next middleware
   * @memberof FlipCoinGameController
   */
  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await FlipCoinGamePlaceBetService.execute(req.body, req.context)
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
   * @memberof FlipCoinGameController
   */
  static async getMyBets (req, res, next) {
    try {
      const { result, successful, errors } = await GetFlipCoinGameMyBetsService.execute(req.query, req.context)
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
   * @memberof FlipCoinGameController
   */
  static async checkFairness (req, res, next) {
    try {
      const { result, successful, errors } = await FlipCoinGameCheckProvableFairService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

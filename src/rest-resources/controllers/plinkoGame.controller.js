import { sendResponse } from '../../helpers/response.helpers'
import PlinkoGameCheckProvableFairService from '../../services/game/plinko/plinkoGameCheckProvableFair.service'
import PlinkoGameGetBetsService from '../../services/game/plinko/plinkoGameGetBets.service'
import PlinkoGameLightningBoardDetails from '../../services/game/plinko/plinkoGameLightningBoardDetails.service'
import PlinkoGamePlaceBetService from '../../services/game/plinko/plinkoGamePlaceBet.service'

/**
 * PlinkoGame Controller for handling Plinko Game
 *
 * @export
 * @class PlinkoGameController
 */
export default class PlinkoGameController {
  static async getBets (req, res, next) {
    try {
      const { result, successful, errors } = await PlinkoGameGetBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await PlinkoGamePlaceBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async postLightningBoardDetails (req, res, next) {
    try {
      const { result, successful, errors } = await PlinkoGameLightningBoardDetails.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async checkFairness (req, res, next) {
    try {
      const { result, successful, errors } = await PlinkoGameCheckProvableFairService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

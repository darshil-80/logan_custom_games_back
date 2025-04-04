import { sendResponse } from '../../helpers/response.helpers'
import DiceGameCheckProvableFairService from '../../services/game/dice/diceGameCheckProvableFair.service'
import DiceGameGetBetsService from '../../services/game/dice/diceGameGetBets.service'
import DiceGamePlaceBetService from '../../services/game/dice/diceGamePlaceBet.service'

/**
 * DiceGame Controller for handling Dice Game
 *
 * @export
 * @class DiceGameController
 */
export default class DiceGameController {
  static async getBets (req, res, next) {
    try {
      const { result, successful, errors } = await DiceGameGetBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await DiceGamePlaceBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async checkFairness (req, res, next) {
    try {
      const { result, successful, errors } = await DiceGameCheckProvableFairService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

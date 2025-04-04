import { sendResponse } from '../../helpers/response.helpers'
import BlackJackGameHitService from '../../services/game/blackJack/blackJackGameHit.service'
import BlackJackGameStandService from '../../services/game/blackJack/blackJackGameStand.service'
import BlackJackGameGetBetsService from '../../services/game/blackJack/blackJackGameGetBets.service'
import BlackJackGamePlaceBetService from '../../services/game/blackJack/blackJackGamePlaceBet.service'
import BlackJackGameSplitBetService from '../../services/game/blackJack/blackJackGameSplitBet.service'
import BlackJackGameDoubleBetService from '../../services/game/blackJack/blackJackGameDoubleBet.service'

/**
 * BlackJack Controller for handling BlackJack Game
 *
 * @export
 * @class BlackJackGameController
 */
export default class BlackJackGameController {
  static async getBets (req, res, next) {
    try {
      const { result, successful, errors } = await BlackJackGameGetBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await BlackJackGamePlaceBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async hit (req, res, next) {
    try {
      const { result, successful, errors } = await BlackJackGameHitService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async stand (req, res, next) {
    try {
      const { result, successful, errors } = await BlackJackGameStandService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async doubleBet (req, res, next) {
    try {
      const { result, successful, errors } = await BlackJackGameDoubleBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async splitBet (req, res, next) {
    try {
      const { result, successful, errors } = await BlackJackGameSplitBetService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

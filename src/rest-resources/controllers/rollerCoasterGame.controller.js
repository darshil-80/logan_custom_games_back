import { sendResponse } from '../../helpers/response.helpers'
import GetRollerCoasterBetDetailService from '../../services/game/rollerCoaster/getRollerCoasterBetDetail.service'
import GetRollerCoasterBetsService from '../../services/game/rollerCoaster/getRollerCoasterBets.service'
import GetRollerCoasterGraphDataService from '../../services/game/rollerCoaster/getRollerCoasterGraphData.service'
import RollerCoasterGameCashOutBetService from '../../services/game/rollerCoaster/rollerCoasterGameCashOutBet.service'
import RollerCoasterGamePlaceBetService from '../../services/game/rollerCoaster/rollerCoasterGamePlaceBet.service'
import RollerCoasterGamePlaceBetUpdateService from '../../services/game/rollerCoaster/updateRollerCoasterBetToAutoBet.service'

/**
 * RollerCoasterGame Controller for handling all the request of /rollerCoasterGame path
 *
 * @export
 * @class RollerCoasterGameController
 */
export default class RollerCoasterGameController {
  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await RollerCoasterGamePlaceBetService.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async cashOutBet (req, res, next) {
    try {
      const { result, successful, errors } = await RollerCoasterGameCashOutBetService.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async graphData (req, res, next) {
    try {
      const { result, successful, errors } = await GetRollerCoasterGraphDataService.execute({ ...req.query }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getAllBets (req, res, next) {
    try {
      const { result, successful, errors } = await GetRollerCoasterBetsService.execute({ ...req.query }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async betDetail (req, res, next) {
    try {
      const { result, successful, errors } = await GetRollerCoasterBetDetailService.execute({ ...req.query }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async betUpdate (req, res, next) {
    try {
      const { result, successful, errors } = await RollerCoasterGamePlaceBetUpdateService.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

import { sendResponse } from '../../helpers/response.helpers'
import MineGameGetBetsService from '../../services/game/mine/mineGameGetBets.service'
import MineGamePlaceBetService from '../../services/game/mine/mineGamePlaceBet.service'
import MineGameOpenTileService from '../../services/game/mine/mineGameOpenTile.service'
import MineGameCashOutBetService from '../../services/game/mine/mineGameCashOutBet.service'
import MineGamePlaceAutoBetService from '../../services/game/mine/mineGamePlaceAutoBet.service'
import MineGameCheckProvableFairService from '../../services/game/mine/mineGameCheckProvableFair.service'
import GetMineGameTopBetsService from '../../services/game/mine/getMineGameTopBets.service'
import MineGameGetUnfinishedGameStateService from '../../services/game/mine/mineGameGetUnfinishedGameState.service'
import GetMineGameLiveStatsService from '../../services/game/mine/getMineGameLiveStats.service'
import MineGameEmitter from '../../socket-resources/emitters/mineGame.emitter'

/**
 * MineGame Controller for handling Mine Game
 *
 * @export
 * @class MineGameController
 */
export default class MineGameController {
  // static async getBets (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await MineGameGetBetsService.execute(req.query, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await MineGamePlaceBetService.execute({userId: req.headers.userid,...req.body}, {})

      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async openTile (req, res, next) {
    try {
      const { result, successful, errors } = await MineGameOpenTileService.execute({userId: req.headers.userid, ...req.body}, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async cashOutBet (req, res, next) {
    try {
      const { result, successful, errors } = await MineGameCashOutBetService.execute({userId: req.headers.userid, ...req.body}, req.context)

      // const liveStatsResult = await GetMineGameLiveStatsService.run({}, {
      //   ...req.context,
      //   sequelizeTransaction: null
      // })

      // MineGameEmitter.emitMineGameLiveStats(liveStatsResult)

      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  // static async checkProvableFair (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await MineGameCheckProvableFairService.execute(req.body, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // static async topBets (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await GetMineGameTopBetsService.execute(req.body, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // static async getUnfinishedGameState (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await MineGameGetUnfinishedGameStateService.execute(req.body, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  static async autoBet (req, res, next) {
    try {
      const { result, successful, errors } = await MineGamePlaceAutoBetService.execute({userId: req.headers.userid, ...req.body}, req.context)

      // const liveStatsResult = await GetMineGameLiveStatsService.run({}, {
      //   ...req.context,
      //   sequelizeTransaction: null
      // })

      // MineGameEmitter.emitMineGameLiveStats(liveStatsResult)

      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  // static async liveStats (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await GetMineGameLiveStatsService.execute(req.body, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}

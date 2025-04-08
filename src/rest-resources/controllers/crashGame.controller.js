import CrashGameCancelBetService from '../../services/game/crash/crashGameCancelBet.service'
import CrashGameGetAllPlacedBetsService from '../../services/game/crash/crashGameGetAllPlacedBets.service'
import CrashGameGetHistoryService from '../../services/game/crash/crashGameGetHistory.service'
import CrashGamePlaceBetService from '../../services/game/crash/crashGamePlaceBet.service'
import CrashGamePlayerEscapeService from '../../services/game/crash/crashGamePlayerEscape.service'
import CrashGameGetAllBetsService from '../../services/game/crash/crashGameGetAllBets.service'
import CrashGameGetHighRollerBetsService from '../../services/game/crash/crashGameGetHighRollerBets.service'
import CrashGameGetMyBetsService from '../../services/game/crash/crashGameGetMyBets.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'
import { sendResponse } from '../../helpers/response.helpers'
import { DEFAULT_GAME_ID } from '../../libs/constants'
import { getCachedData, removeData, setData } from '../../helpers/redis.helpers'
import { BetAlreadyInProgressErrorType } from '../../libs/errorTypes'
import GetAllUpliftingWordsService from '../../services/upliftingWords/getAllUpliftingWords.service'
import CheckProvableFairService from '../../services/game/crash/crashGameCheckProvableFair.service'
import CrashGameGetAllRoundPlacedBetsService from '../../services/game/crash/crashGameGetAllRoundPlacedBets.service'
import { crashGameQueue, JOB_RESTART_CRASH_GAME } from '../../queues/crashGame.queue'
import inMemoryDB from '../../libs/inMemoryDb'

/**
 * CrashGame Controller for handling all the request of /crashGame path
 *
 * @export
 * @class CrashGameController
 */
export default class CrashGameController {
  // static async CrashGameGetStatus (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await CrashGameGetStatusService.execute(req.query, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // static async getCrashGameRoundDetail (req, res, next) {
  //   try {
  //     const { result, successful, errors } = await CrashGameGetRoundDetailService.execute(req.query, req.context)
  //     sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  static async getCrashGameHistory (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGameGetHistoryService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async placeBetCrashGame (req, res, next) {
    console.log("allusersss", await inMemoryDB.getAll('users'))
    const user = await inMemoryDB.get('users', req.headers.userid)
    console.log("useruser", user, req.headers);

    const cacheTokenKey = `Bet-${DEFAULT_GAME_ID.CRASH}-${user.id}`

    try {
      const alreadyPlacedBet = await getCachedData(cacheTokenKey)

      if (alreadyPlacedBet) {
        next(BetAlreadyInProgressErrorType)
        return
      }

      await setData(cacheTokenKey, 'true', 10)

      const { result, successful, errors } = await CrashGamePlaceBetService.execute({userId: req.headers.userid, ...req.body}, req.context)

      if (!successful) {
        await removeData(cacheTokenKey)
        return
      }

      const placedBets = await CrashGameGetAllPlacedBetsService.execute({ roundId: result.roundId }, req.context)

      if (placedBets.failed) {
        return
      }

      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })

      CrashGameEmitter.emitCrashGamePlacedBets(placedBets.result)
    } catch (error) {
      await removeData(cacheTokenKey)
      next(error)
    }
  }

  static async cancelBetCrashGame (req, res, next) {
    try {
      const user = await inMemoryDB.get('users', req.headers.userid)
      const { result, successful, errors } = await CrashGameCancelBetService.execute({userId: req.headers.userid, ...req.query}, req.context)

      if (!successful) {
        return
      }

      const cacheTokenKey = `Bet-${DEFAULT_GAME_ID.CRASH}-${user.id}`
      await removeData(cacheTokenKey)

      const placedBets = await CrashGameGetAllPlacedBetsService.execute({ roundId: result.roundId }, req.context)

      if (placedBets.failed) {
        return
      }

      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })

      CrashGameEmitter.emitCrashGamePlacedBets(placedBets.result)
    } catch (error) {
      next(error)
    }
  }

  static async playerEscapeCrashGame (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGamePlayerEscapeService.execute({userId: req.headers.userid, ...req.query}, req.context)
      console.log("innnnnnnnnnnnnnnnnnn", result)

      if (!successful) {
        return
      }

      const placedBets = await CrashGameGetAllPlacedBetsService.execute({ roundId: result.roundId }, req.context)

      if (placedBets.failed) {
        return
      }

      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })

      CrashGameEmitter.emitCrashGamePlacedBets(placedBets.result)
    } catch (error) {
      next(error)
    }
  }

  /**
* Controller method to get a user's bets.
*
* @static
* @param {object} req - object contains all the request params sent from the client
* @param {object} res - object contains all the response params sent to the client
* @param {function} next - function to execute next middleware
* @memberof CrashGameController
*/
  static async myBets (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGameGetMyBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to get top bets
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CrashGameController
  */
  static async topBets (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGameGetHighRollerBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to get all bets
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CrashGameController
  */
  static async allBets (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGameGetAllBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  /**
  * Controller method to get all uplifting words
  *
  * @static
  * @param {object} req - object contains all the request params sent from the client
  * @param {object} res - object contains all the response params sent to the client
  * @param {function} next - function to execute next middleware
  * @memberof CrashGameController
  */
  static async getAllUpliftingWords (req, res, next) {
    try {
      const { result, successful, errors } = await GetAllUpliftingWordsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getAllPlacedBets (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGameGetAllPlacedBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
      // CrashGameEmitter.emitCrashGamePlacedBets(placedBets.result)
    } catch (error) {
      next(error)
    }
  }

  static async checkProvableFair (req, res, next) {
    try {
      const { result, successful, errors } = await CheckProvableFairService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getAllRoundPlacedBets (req, res, next) {
    try {
      const { result, successful, errors } = await CrashGameGetAllRoundPlacedBetsService.execute(req.query, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
      // CrashGameEmitter.emitCrashGamePlacedBets(placedBets.result)
    } catch (error) {
      next(error)
    }
  }

  /**
 *
 *
 * @static
 * @param {object} req - object contains all the request params sent from the client
 * @param {object} res - object contains all the response params sent to the client
 * @param {function} next - function to execute next middleware
 * @memberof CrashGameController
 */
  static restartCrashGame (req, res, next) {
    crashGameQueue.add(JOB_RESTART_CRASH_GAME, {
      priority: 1
    })
    res.sendStatus(200)
  }
}

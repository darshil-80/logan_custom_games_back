import Flatted from 'flatted'
import { validateData } from '../../helpers/ajv.helpers'
import ajv from '../../libs/ajv'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES } from '../../libs/constants'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'

// const crashGamePlacedBetsSchema = {
//   type: 'array',
//   items: {
//     $ref: '/crashGameBet.json#'
//   }
// }

// ajv.addSchema(crashGamePlacedBetsSchema, 'emitCrashGamePlacedBets')

/**
 * Crash Game Emitter for Emitting things related to the /crash-game namespace
 *
 * @export
 * @class CrashGameEmitter
 */
export default class CrashGameEmitter {
  static async emitCrashGamePlacedBets (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitCrashGamePlacedBets', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_PLACED_BETS, { data: payload })
      } else {
        Logger.info('Error In Emitter', { message: 'Validation Error', fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Placed Bets' })
      Logger.info('Actual Error', { exception: error })
    }
  }

  static async emitCrashGameWaitingTimer (payload) {
    payload = Flatted.parse(Flatted.stringify(payload))
    try {
      const [isValid, errors] = validateData('emitCrashGameWaitingTimer', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_WAITING_TIMER, { data: payload })
      } else {
        Logger.info(SocketResponseValidationErrorType.name, { message: SocketResponseValidationErrorType.description, fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Waiting Timer' })
      Logger.info('Actual Error', { exception: error })
    }
  }

  static async emitCrashGameGraphTimer (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitCrashGameGraphTimer', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_GRAPH_TIMER, { data: payload })
      } else {
        Logger.info(SocketResponseValidationErrorType.name, { message: SocketResponseValidationErrorType.description, fault: errors })
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_GRAPH_TIMER, new APIError())
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Graph Timer' })
      Logger.info('Actual Error', { exception: error })
    }
  }

  static async emitCrashGamePlacedBets (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitCrashGamePlacedBets', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_PLACED_BETS, { data: payload })
      } else {
        Logger.info('Error In Emitter', { message: 'Validation Error', fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Placed Bets' })
      Logger.info('Actual Error', { exception: error })
    }
  }

  static async emitCrashGameRoundStarted (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitCrashGameRoundStarted', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_ROUND_STARTED, { data: payload })
      } else {
        Logger.info('Error In Emitter', { message: 'Validation Error', fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Round Started' })
      Logger.info('Actual Error', { exception: error })
    }
  }

  static async emitCrashGameRoundBettingOnHold (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitCrashGameRoundBettingOnHold', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_ROUND_BETTING_ON_HOLD, { data: payload })
      } else {
        Logger.info('Error In Emitter', { message: 'Validation Error', fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Round Betting On Hold' })
      Logger.info('Actual Error', { exception: error })
    }
  }

  static async emitCrashGameRoundStopped (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitCrashGameRoundStopped', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.CRASH_GAME).emit(SOCKET_EMITTERS.CRASH_GAME_ROUND_STOPPED, { data: payload })
      } else {
        Logger.info('Error In Emitter', { message: 'Validation Error', fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Round Stopped' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

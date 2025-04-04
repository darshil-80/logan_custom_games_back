import Flatted from 'flatted'
import { validateData } from '../../helpers/ajv.helpers'
import ajv from '../../libs/ajv'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES } from '../../libs/constants'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'

const crashGamePlacedBetsSchema = {
  type: 'array',
  items: {
    $ref: '/crashGameBet.json#'
  }
}

ajv.addSchema(crashGamePlacedBetsSchema, 'emitCrashGamePlacedBets')

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
}

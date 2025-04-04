import Flatted from 'flatted'
import { validateData } from '../../helpers/ajv.helpers'
import ajv from '../../libs/ajv'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES } from '../../libs/constants'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'

const rollerCoasterPlacedBetsSchema = {
  type: 'array',
  items: {
    $ref: '/rollerCoasterBet.json#'
  }
}

ajv.addSchema(rollerCoasterPlacedBetsSchema, 'emitRollerCoasterPlacedBets')

/**
 * Roller Coaster Game Emitter for Emitting things related to the /crash-game namespace
 *
 * @export
 * @class RollerCoasterEmitter
 */
export default class RollerCoasterEmitter {
  static async emitRollerCoasterPlacedBets (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitRollerCoasterPlacedBets', payload)
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

  static async emitRollerCoasterClosedBet (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      socketEmitter.of(SOCKET_NAMESPACES.ROLLER_COASTER_GAME).emit(SOCKET_EMITTERS.ROLLER_COASTER_GAME_CLOSED_BETS, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Placed Bets' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

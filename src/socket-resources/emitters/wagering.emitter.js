import Flatted from 'flatted'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'

/**
 *  Wagering Emitter for Emitting things related to the /wagering namespace
 *
 * @export
 * @class WageringEmitter
 */
export default class WageringEmitter {
  static async emitWagering (payload, userId) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const room = SOCKET_ROOMS.WAGERING_USER + ':' + userId
      socketEmitter.of(SOCKET_NAMESPACES.WAGERING).to(room).emit(SOCKET_EMITTERS.WAGERING_COMPLETION, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting wagering details' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

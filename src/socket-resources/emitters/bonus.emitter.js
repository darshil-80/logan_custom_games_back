import Flatted from 'flatted'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'

/**
 * Wallet Emitter for Emitting things related to the /wallet namespace
 *
 * @export
 * @class BonusEmitter
 */
export default class BonusEmitter {
  static async emitBonus (payload, userId) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const room = SOCKET_ROOMS.BONUS_USER + ':' + userId
      socketEmitter.of(SOCKET_NAMESPACES.BONUS).to(room).emit(SOCKET_EMITTERS.BONUS_AMOUNT, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting bonus amount Balance' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

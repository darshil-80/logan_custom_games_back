import Flatted from 'flatted'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES } from '../../libs/constants'

/**
 * Wallet Emitter for Emitting things related to the /wallet namespace
 *
 * @export
 * @class WalletEmitter
 */
export default class LiveChatsEmitter {
  static async emitLiveChats (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      socketEmitter.of(SOCKET_NAMESPACES.LIVE_CHATS).emit(SOCKET_EMITTERS.LIVE_CHATS_VIEW, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on User Wallet Balance' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

import Flatted from 'flatted'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'

/**
 * Wallet Emitter for Emitting things related to the /wallet namespace
 *
 * @export
 * @class WalletEmitter
 */
export default class WalletEmitter {
  static async emitUserWalletBalance (payload, userID) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const room = SOCKET_ROOMS.WALLET_USER + ':' + userID
      Logger.info(`Update wallet socket EMIT: START :: ${room} >>`, { message: JSON.stringify(payload) });
      socketEmitter.of(SOCKET_NAMESPACES.WALLET).to(room).emit(SOCKET_EMITTERS.WALLET_USER_WALLET_BALANCE, { data: payload })
      Logger.info('Update wallet socket EMIT: END :: >>', );

    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on User Wallet Balance' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

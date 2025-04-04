import Flatted from 'flatted'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES } from '../../libs/constants'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'

/**
 * Roller Coaster Game Emitter for Emitting things related to the /crash-game namespace
 *
 * @export
 * @class CryptoFuturesEmitter
 */
export default class CryptoFuturesEmitter {
  static async emitCryptoFuturesClosedBets (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      socketEmitter.of(SOCKET_NAMESPACES.CRYPTO_FUTURES).emit(SOCKET_EMITTERS.CRYPTO_FUTURES_CLOSED_BETS, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on Crash Game Placed Bets' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

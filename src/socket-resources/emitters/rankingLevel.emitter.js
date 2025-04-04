import Flatted from 'flatted'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'

/**
 * Ranking Level Emitter for Emitting things related to the /ranking level namespace
 *
 * @export
 * @class RankingLevelEmitter
 */
export default class RankingLevelEmitter {
  static async emitUserRankingLevel (payload, userID) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const room = SOCKET_ROOMS.USER_RANKING_LEVEL + ':' + userID
      socketEmitter.of(SOCKET_NAMESPACES.RANKING_LEVEL).to(room).emit(SOCKET_EMITTERS.UPDATE_RANKING_LEVEL, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on User Ranking Level' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

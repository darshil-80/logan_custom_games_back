import Flatted from 'flatted'
import { validateData } from '../../helpers/ajv.helpers'
import ajv from '../../libs/ajv'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES } from '../../libs/constants'
import { SocketResponseValidationErrorType } from '../../libs/errorTypes'

const schema = {
  type: 'object',
  properties: {
    statistics: {
      type: 'object',
      properties: {
        totalProfit: { type: 'number' },
        totalWagered: { type: 'number' },
        totalWins: { type: 'number' },
        totalLost: { type: 'number' }
      },
      required: ['totalProfit', 'totalWagered', 'totalWins', 'totalLost']
    }
  }
}

ajv.addSchema(schema, 'emitMineGameLiveStats')

/**
 * Mine Game Emitter for Emitting things related to the /demo namespace
 *
 * @export
 * @class MineGameEmitter
 */
export default class MineGameEmitter {
  static async emitMineGameLiveStats (payload) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const [isValid, errors] = validateData('emitMineGameLiveStats', payload)
      if (isValid) {
        socketEmitter.of(SOCKET_NAMESPACES.MINE_GAME).emit(SOCKET_EMITTERS.MINE_GAME_LIVE_STATS, { data: payload })
      } else {
        Logger.info(SocketResponseValidationErrorType.name, { message: SocketResponseValidationErrorType.description, fault: errors })
      }
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting on hello world' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

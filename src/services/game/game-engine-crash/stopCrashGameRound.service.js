import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class StopCrashGameRoundService
 * @extends {ServiceBase}
 */
export default class StopCrashGameRoundService extends ServiceBase {
  async run () {
    let roundDetails = [];

    roundDetails = await inMemoryDB.findAllByField('crashGameRounddetails', 'roundId', this.args.roundId)
    const roundDetail = await roundDetails.find(round => [CRASH_GAME_STATE.ON_HOLD, CRASH_GAME_STATE.GRAPH_FINISHED].includes(round.roundState))

    if (!roundDetail) {
      this.addError('InvalidGameRoundErrorType', `no round found with details roundId ${this.args.roundId}`)
      return
    }

    roundDetail.roundState = CRASH_GAME_STATE.STOPPED
    await inMemoryDB.set('crashGameRounddetails', roundDetail.id, roundDetail)
    const updatedRoundDetail = await inMemoryDB.get('crashGameRounddetails', roundDetail.id)

    return updatedRoundDetail || {}
  }
}

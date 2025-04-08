import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class StopCrashGameRoundGraphService
 * @extends {ServiceBase}
 */
export default class StopCrashGameRoundGraphService extends ServiceBase {
  async run () {
    let roundDetails = [];

    roundDetails = await inMemoryDB.findAllByField('crashGameRounddetails', 'roundId', this.args.roundId)

    const roundDetail = await roundDetails.find(round => round.roundState === CRASH_GAME_STATE.ON_HOLD);

    if (!roundDetail) {
      this.addError('InvalidGameRoundErrorType', `no round found with details roundId ${this.args.roundId}`)
      return
    }
    roundDetail.roundState = CRASH_GAME_STATE.GRAPH_FINISHED
    await inMemoryDB.set('crashGameRounddetails', roundDetail.id, roundDetail)

    return roundDetail || {}
  }
}

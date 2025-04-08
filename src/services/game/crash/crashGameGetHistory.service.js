import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'
/**
 *
 *
 * @export
 * @class CrashGameGetHistoryService
 * @extends {ServiceBase}
 */
export default class CrashGameGetHistoryService extends ServiceBase {
  async run () {
    const crashGameRounddetails = await inMemoryDB.getAll('crashGameRounddetails')
    const roundDetails = crashGameRounddetails.filter(crashGameRounddetail => crashGameRounddetail.roundState === CRASH_GAME_STATE.STOPPED)

    if (!roundDetails.length) {
      return []
    }

    return {
      count: roundDetails.length,
      rows: roundDetails.slice(0, 10) || []
    }
  }
}

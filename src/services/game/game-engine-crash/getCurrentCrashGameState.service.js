import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class GetCurrentCrashGameStateService
 * @extends {ServiceBase}
 */
export default class GetCurrentCrashGameStateService extends ServiceBase {
  async run () {
    const crashGameRounddetails = await inMemoryDB.getAll('crashGameRounddetails')

    const currentRound = await crashGameRounddetails[crashGameRounddetails?.length - 1];

    return currentRound || false
  }
}

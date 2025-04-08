import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class GetCrashGameRoundDetailByIdService
 * @extends {ServiceBase}
 */
export default class GetCrashGameRoundDetailByIdService extends ServiceBase {
  async run () {
    const round = await inMemoryDB.findAllByField('crashGameRounddetails', 'roundId', this.args.roundId)

    return round[round.length - 1] || false
  }
}

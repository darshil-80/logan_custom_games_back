import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class SetCrashGameRoundBettingOnHoldService
 * @extends {ServiceBase}
 */
export default class SetCrashGameRoundBettingOnHoldService extends ServiceBase {
  async run () {
    const roundDetail = await inMemoryDB.findByField('crashGameRounddetails', 'roundId', this.args.roundId)
    if (!roundDetail || roundDetail.roundState !== CRASH_GAME_STATE.STARTED) {
      this.addError('InvalidGameRoundErrorType', `no round found with details roundId ${this.args.roundId}`)
      return
    }

    roundDetail.roundState = CRASH_GAME_STATE.ON_HOLD
    roundDetail.onHoldAt = new Date()

    await inMemoryDB.set('crashGameRounddetails', roundDetail.id, roundDetail)

    return roundDetail || {}
  }
}

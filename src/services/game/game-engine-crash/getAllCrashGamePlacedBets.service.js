import { BET_RESULT } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class GetAllCrashGamePlacedBetsService
 * @extends {ServiceBase}
 */
export default class GetAllCrashGamePlacedBetsService extends ServiceBase {
  async run () {
    const bets = await inMemoryDB.findAllByField('crashGameBets', 'roundId', this.args.roundId)
    const roundBets = [...bets]
    const jsonBets = roundBets.filter(bet => {
      if([null, BET_RESULT.LOST, BET_RESULT.WON].includes(bet.result)) { return bet }
    })

    return jsonBets || []
  }
}

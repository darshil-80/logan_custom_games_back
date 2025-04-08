import { BET_RESULT } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class CrashGameGetAllPlacedBetsService
 * @extends {ServiceBase}
 */
export default class CrashGameGetAllPlacedBetsService extends ServiceBase {
  async run () {
    const gameBets = await inMemoryDB.findAllByField('crashGameBets', 'roundId', this.args.roundId)
    const bets = gameBets.filter(bet => {
      if([null, BET_RESULT.LOST, BET_RESULT.WON].includes(bet.result)) {
        return bet
      }
    })

    return bets
  }
}

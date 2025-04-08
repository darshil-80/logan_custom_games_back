import ServiceBase from '../../../libs/serviceBase'
import { DEFAULT_GAME_ID } from '../../../libs/constants'
import GetHouseEdgeAndMinMaxOddsService from './getHouseEdgeAndMinMaxOdds.service'

// const constraints = {
//   time: {
//     type: 'number'
//   }
// }

/**
 *
 *
 * @export
 * @class GetMultiplierByCrashGameGraphTimeService
 * @extends {ServiceBase}
 */
export default class GetMultiplierByCrashGameGraphTimeService extends ServiceBase {
  // get constraints () {
  //   return constraints
  // }

  async run () {
    const { minOdd, maxOdd } = GetHouseEdgeAndMinMaxOddsService.run({ gameId: DEFAULT_GAME_ID.CRASH }, this.context)
    const multiplier = +(Math.pow(2, this.args.time * 0.09)).toFixed(2)
    return +multiplier <= +minOdd ? +(minOdd.toFixed(2)) : multiplier >= maxOdd ? maxOdd : multiplier
  }
}

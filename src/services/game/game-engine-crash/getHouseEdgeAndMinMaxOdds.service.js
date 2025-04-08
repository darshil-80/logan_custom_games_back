import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class GetHouseEdgeAndMinMaxOddsService
 * @extends {ServiceBase}
 */
export default class GetHouseEdgeAndMinMaxOddsService extends ServiceBase {
  async run () {
    const { houseEdge, minOdds, maxOdds } = await inMemoryDB.get('gameSettings', 3)

    return { houseEdge, minOdd: minOdds, maxOdd: maxOdds }
  }
}

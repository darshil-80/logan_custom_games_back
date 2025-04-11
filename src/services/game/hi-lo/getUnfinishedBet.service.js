import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class GetUnfinishedBetService
 * @extends {ServiceBase}
 */
export default class GetUnfinishedBetService extends ServiceBase {
  async run () {
    const { userId } = this.args

    const hiLoGameUnfinishedBet = await inMemoryDB.get('hiloGameBets', userId);

    if (!hiLoGameUnfinishedBet || hiLoGameUnfinishedBet.result !== null) {
      return {
        hasUnfinishedBet: false
      }
    }

    return {
      hasUnfinishedBet: true,
      unfinishedBet: hiLoGameUnfinishedBet
    }
  }
}

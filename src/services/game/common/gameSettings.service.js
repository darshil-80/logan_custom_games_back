import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class GameSettingsService
 * @extends {ServiceBase}
 */
export default class GameSettingsService extends ServiceBase {
  async run () {
    const { gameId } = this.args

    let gameSettingsInfo = {}

    gameSettingsInfo = await inMemoryDB.get('gameSettings', gameId)
    if (!gameSettingsInfo) {
      return this.addError('InvalidGameTypeErrorType', `game ${this.args.gameId}`)
    }

    const { maxBet, minBet, maxProfit, houseEdge, minOdds, maxOdds, minAutoRate } = gameSettingsInfo
    gameSettingsInfo.maxBet = Object.keys(maxBet).map(coinName => ({ coinName, amount: maxBet[coinName] }))
    gameSettingsInfo.minBet = Object.keys(minBet).map(coinName => ({ coinName, amount: minBet[coinName] }))
    gameSettingsInfo.maxProfit = Object.keys(maxProfit).map(coinName => ({ coinName, amount: maxProfit[coinName] }))
    gameSettingsInfo.houseEdge = houseEdge
    gameSettingsInfo.minOdd = minOdds
    gameSettingsInfo.maxOdd = maxOdds
    gameSettingsInfo.minAutoRate = minAutoRate

    return gameSettingsInfo
  }
}

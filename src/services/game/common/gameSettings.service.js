import ajv from '../../../libs/ajv'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    gameId: { type: 'string' }
  },
  required: ['gameId']
}

const constraints = ajv.compile(schema)

/**
 * @export
 * @class GameSettingsService
 * @extends {ServiceBase}
 */
export default class GameSettingsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { gameId } = this.args

    const {
      dbModels: {
        GameSetting: GameSettingModel
      },
      sequelizeTransaction
    } = this.context

    let gameSettingsInfo

    try {
      gameSettingsInfo = await GameSettingModel.findOne({
        where: {
          gameId
        },
        transaction: sequelizeTransaction
      })

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
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }

    return gameSettingsInfo
  }
}

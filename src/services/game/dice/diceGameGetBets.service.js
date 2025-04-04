import { Op } from 'sequelize'
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import { calculateOdds } from '../../../utils/math.utils'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class DiceGameGetBetsService
 * @extends {ServiceBase}
 */
export default class DiceGameGetBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        DiceGameBet: DiceGameBetModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const diceGameBets = await DiceGameBetModel.findAndCountAll({
      where: { userId, result: { [Op.not]: null } },
      order: [['createdAt', 'DESC']],
      limit: this.args.limit,
      offset: this.args.offset,
      transaction: sequelizeTransaction,
      raw: true
    })

    diceGameBets.rows.forEach(diceGameBet => {
      const diceGameSettings = JSON.parse(diceGameBet.currentGameSettings)
      const number = diceGameBet.number
      const probability = diceGameBet.rollOver ? (100 - number) / 101 : number / 101
      diceGameBet.multiplier = calculateOdds(diceGameSettings, 1 / probability)
    })

    return {
      count: diceGameBets.count,
      rows: diceGameBets.rows || []
    }
  }
}

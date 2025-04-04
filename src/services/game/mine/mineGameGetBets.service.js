import { Op } from 'sequelize'
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'

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
 * @class MineGameGetBetsService
 * @extends {ServiceBase}
 */
export default class MineGameGetBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { limit, offset } = this.args

    const {
      dbModels: {
        MineGameBet: MineGameBetModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const mineGameBets = await MineGameBetModel.findAndCountAll({
      where: { userId, result: { [Op.not]: null } },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      transaction: sequelizeTransaction,
      raw: true
    })

    return {
      count: mineGameBets.count,
      rows: mineGameBets.rows || []
    }
  }
}

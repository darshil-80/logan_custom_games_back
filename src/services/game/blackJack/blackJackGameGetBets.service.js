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
 * @class BlackJackGameGetBetsService
 * @extends {ServiceBase}
 */
export default class BlackJackGameGetBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        BlackJackGameBet: BlackJackGameBetModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const blackJackGameBets = await BlackJackGameBetModel.findAndCountAll({
      where: { userId, result: { [Op.not]: null } },
      order: [['createdAt', 'DESC']],
      limit: this.args.limit,
      offset: this.args.offset,
      transaction: sequelizeTransaction,
      raw: true
    })

    return {
      count: blackJackGameBets.count,
      rows: blackJackGameBets.rows || []
    }
  }
}

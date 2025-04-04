import { Op } from 'sequelize'
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import { BET_RESULT } from '../../../libs/constants'

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
 * @class CrashGameGetAllBetsService
 * @extends {ServiceBase}
 */
export default class CrashGameGetAllBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        CrashGameBet: CrashGameBetModel,
        User: UserModel
      },
      sequelizeTransaction
    } = this.context

    const crashGameBets = await CrashGameBetModel.findAndCountAll({
      where: {
        result: {
          [Op.ne]: BET_RESULT.CANCELLED
        }
      },
      order: [['createdAt', 'DESC']],
      limit: this.args.limit,
      offset: this.args.offset,
      include: {
        model: UserModel,
        as: 'user'
      },
      transaction: sequelizeTransaction
    })

    return {
      count: crashGameBets.count,
      rows: crashGameBets.rows.map(user => user?.toJSON()) || []
    }
  }
}

import ajv from '../../../libs/ajv'
import { BET_RESULT } from '../../../libs/constants'
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
 * @class PlinkoGameGetBetsService
 * @extends {ServiceBase}
 */
export default class PlinkoGameGetBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        PlinkoGameBet: PlinkoGameBetModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const plinkoGameBets = await PlinkoGameBetModel.findAndCountAll({
      where: {
        userId,
        result: [BET_RESULT.WON, BET_RESULT.LOST]
      },
      order: [['createdAt', 'DESC']],
      limit: this.args.limit,
      offset: this.args.offset,
      transaction: sequelizeTransaction,
      raw: true
    })

    return {
      count: plinkoGameBets.count,
      rows: plinkoGameBets.rows || []
    }
  }
}

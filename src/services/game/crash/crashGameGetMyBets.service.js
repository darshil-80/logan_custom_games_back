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
 * @class CrashGameGetMyBetsService
 * @extends {ServiceBase}
 */
export default class CrashGameGetMyBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        CrashGameRoundDetail: CrashGameRoundDetailModel,
        CrashGameBet: CrashGameBetModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const crashGameBets = await CrashGameBetModel.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: this.args.limit,
      offset: this.args.offset,
      transaction: sequelizeTransaction,
      include: {
        model: CrashGameRoundDetailModel,
        as: 'crashGameRoundDetail'
      }
    })

    return {
      count: crashGameBets.count,
      rows: crashGameBets.rows.map(crashGameRoundDetail => crashGameRoundDetail?.toJSON()) || []
    }
  }
}

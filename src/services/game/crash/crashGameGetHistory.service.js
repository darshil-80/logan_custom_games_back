import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string', default: '10' },
    offset: { type: 'string', default: '0' }
  }
}

const constraints = ajv.compile(schema)

/**
 *
 *
 * @export
 * @class CrashGameGetHistoryService
 * @extends {ServiceBase}
 */
export default class CrashGameGetHistoryService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { limit, offset } = this.args

    const {
      dbModels: {
        CrashGameRoundDetail: CrashGameRoundDetailModel
      },
      sequelizeTransaction
    } = this.context

    const roundDetails = await CrashGameRoundDetailModel.findAndCountAll({
      where: {
        roundState: CRASH_GAME_STATE.STOPPED
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      transaction: sequelizeTransaction
    })

    if (!roundDetails) {
      return []
    }

    return {
      count: roundDetails.count,
      rows: roundDetails.rows || []
    }
  }
}

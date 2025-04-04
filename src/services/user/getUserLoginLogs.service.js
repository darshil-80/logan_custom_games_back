import _ from 'lodash'
import moment from 'moment'
import { Op } from 'sequelize'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to get Login Logs
 * @export
 * @class  GetLoginLogsService
 * @extends {ServiceBase}
 */
export default class GetLoginLogsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        LoginLog: LoginLogModel,
        User: UserModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const { limit, offset, startDate, endDate } = this.args

    const whereCondition = {
      userId,
      ...((startDate && endDate)
        ? { createdAt: { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } }
        : {})
    }

    const filterLoginLog = _.omitBy(whereCondition, _.isNil)

    const loginLogs = await LoginLogModel.findAndCountAll({
      where: filterLoginLog,
      include: {
        model: UserModel,
        as: 'user',
        attributes: ['loginMethod']
      },
      limit,
      offset,
      order: [
        ['loginTime', 'DESC']
      ],
      transaction: sequelizeTransaction
    })

    return loginLogs
  }
}

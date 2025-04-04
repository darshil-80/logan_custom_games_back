import _ from 'lodash'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'
import moment from 'moment'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    transactionId: { type: 'string' },
    transactionType: { type: 'string' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to show user sportsbook-transactions
 * @export
 * @class GetUserSportsbookTransactionsService
 * @extends {ServiceBase}
 */
export default class GetUserSportsbookTransactionsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        SportBettingTransaction: SportBettingTransactionModel
      },
      sequelizeTransaction
    } = this.context

    const { limit, offset, transactionId, transactionType, startDate, endDate } = this.args

    const whereCondition = {
      actioneeId: this.context.auth.id,
      ...((startDate && endDate)
        ? { createdAt: { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } }
        : {}),
      ...((transactionType)
        ? { transactionType: { [Op.iLike]: `%${transactionType}%` } }
        : {}),
      ...((transactionId)
        ? { transactionId: { [Op.iLike]: `%${transactionId}%` } }
        : {})
    }

    const filterTransaction = _.omitBy(whereCondition, _.isNil)

    const transactionsDetails = await SportBettingTransactionModel.findAndCountAll({
      where: filterTransaction,
      limit,
      offset,
      order: [
        ['id', 'DESC']
      ],
      transaction: sequelizeTransaction
    })

    return transactionsDetails
  }
}

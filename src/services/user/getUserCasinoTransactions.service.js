import ajv from '../../libs/ajv'
import sequelize, { Op } from 'sequelize'
import ServiceBase from '../../libs/serviceBase'
import { USER_TYPES } from '../../libs/constants'
import moment from 'moment'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to show all smartsoft casino transactions of login user
 * @export
 * @class GetAllCasinoTransactionsService
 * @extends {ServiceBase}
 */
export default class GetUserCasinoTransactionsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        CasinoTransaction: CasinoTransactionModel,
        CasinoGame: CasinoGameModel,
        User: UserModel
      },
      sequelizeTransaction
    } = this.context

    const { limit, offset, startDate, endDate } = this.args

    const query = {
      actioneeId: this.context.auth.id,
      actioneeType: USER_TYPES.USER,
      ...((startDate && endDate)
        ? { createdAt: { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } }
        : {})
    }

    const transactionsDetails = await CasinoTransactionModel.findAndCountAll({
      where: query,
      attributes: ['transactionInfo', 'transactionId', 'actioneeId', 'transactionType', 'actionType', 'createdAt',
        [sequelize.literal('sum(case when  transaction_type = \'debit\' and action_type = \'casino-bet\' then amount else 0 end)'), 'bet'],
        [sequelize.literal('sum(case when transaction_type = \'credit\' and action_type = \'casino-win\' then amount else 0 end)'), 'win'],
        [sequelize.literal('max(CASE WHEN transaction_type = \'debit\' THEN "CasinoTransaction"."created_at" END)'), 'debitCreatedAt']
      ],
      include: [
        { model: CasinoGameModel, attributes: ['gameName'], as: 'casino' },
        { model: UserModel, attributes: ['userName'], as: 'user' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      group: ['transactionId', 'actioneeId', 'createdAt', 'transactionType', 'actionType', 'transactionInfo', 'user.id', 'casino.id'],
      transaction: sequelizeTransaction
    })

    return { count: transactionsDetails.count.length, rows: transactionsDetails.rows }
  }
}

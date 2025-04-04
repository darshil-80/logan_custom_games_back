import ajv from '../../libs/ajv'
import sequelize from 'sequelize'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to show custom game transactions
 * @export
 * @class GetCustomGameTransactionsService
 * @extends {ServiceBase}
 */
export default class GetCustomGameTransactionsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Transaction: TransactionModel,
        Game: GameModel,
        User: UserModel
      },
      sequelizeTransaction
    } = this.context

    const { limit, offset } = this.args

    const transactionsDetails = await TransactionModel.findAll({
      attributes: ['betId', 'gameId',
        [sequelize.literal('sum(case when transaction_type = \'win\' then amount else 0 end)'), 'win'],
        [sequelize.literal('sum(case when transaction_type = \'bet\' then amount else 0 end)'), 'bet'],
        [sequelize.literal('max(CASE WHEN transaction_type = \'bet\' THEN "Transaction"."created_at" END)'), 'betCreatedAt']
      ],
      include: [
        { model: GameModel, attributes: ['name'], as: 'game' },
        { model: UserModel, attributes: ['userName'], as: 'user' }
      ],
      limit,
      offset,
      order: [
        [sequelize.literal('max(CASE WHEN transaction_type = \'bet\' THEN "Transaction"."created_at" END)'), 'DESC']
      ],
      group: ['betId', 'gameId', 'game.id', 'user.id'],
      transaction: sequelizeTransaction
    })

    return { count: transactionsDetails.length, rows: transactionsDetails }
  }
}

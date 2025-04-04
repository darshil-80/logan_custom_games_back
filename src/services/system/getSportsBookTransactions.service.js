import ajv from '../../libs/ajv'
import sequelize from 'sequelize'
import ServiceBase from '../../libs/serviceBase'
import { USER_TYPES } from '../../libs/constants'

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
 * @class GetSportsBookTransactionsService
 * @extends {ServiceBase}
 */
export default class GetSportsBookTransactionsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        SportBettingTransaction: SportBettingTransactionModel,
        NuxGame: NuxGameModel,
        User: UserModel
      },
      sequelizeTransaction
    } = this.context

    const { limit, offset, userId } = this.args

    let query = {}

    if (userId) {
      query = { ...query, actioneeId: userId, actioneeType: USER_TYPES.USER }
    }

    const transactionsDetails = await SportBettingTransactionModel.findAll({
      where: query,
      attributes: ['eventId', 'gameId',
        [sequelize.literal('sum(case when transaction_type = \'credit\' then amount else 0 end)'), 'win'],
        [sequelize.literal('sum(case when transaction_type = \'debit\' then amount else 0 end)'), 'bet'],
        [sequelize.literal('max(CASE WHEN transaction_type = \'debit\' THEN "SportBettingTransaction"."created_at" END)'), 'betCreatedAt']
      ],
      include: [
        { model: NuxGameModel, attributes: ['name'], as: 'game' },
        { model: UserModel, attributes: ['userName'], as: 'user' }
      ],
      limit,
      offset,
      order: [
        [sequelize.literal('max(CASE WHEN transaction_type = \'debit\' THEN "SportBettingTransaction"."created_at" END)'), 'DESC']
      ],
      group: ['eventId', 'gameId', 'game.game_id', 'user.id'],
      transaction: sequelizeTransaction
    })

    return { count: transactionsDetails.length, rows: transactionsDetails }
  }
}

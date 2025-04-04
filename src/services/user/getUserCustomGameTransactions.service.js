import moment from 'moment'
import sequelize, { Op } from 'sequelize'
import ajv from '../../libs/ajv'
import { DEFAULT_GAME_ID } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    isCrypto: { type: 'boolean' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to show user custom game transactions
 * @export
 * @class GetCustomGameTransactionsService
 * @extends {ServiceBase}
 */
export default class GetUserCustomGameTransactionsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Transaction: TransactionModel,
        Game: GameModel,
        User: UserModel,
        CryptoFuturesBet: CryptoFuturesBetModel,
        CryptoFuturesInstrument: CryptoFuturesInstrumentModel
      },
      sequelizeTransaction
    } = this.context

    const { limit, offset, startDate, endDate, isCrypto } = this.args

    const query = {
      actioneeId: this.context.auth.id,
      ...((startDate && endDate)
        ? { createdAt: { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } }
        : {})
    }

    if (isCrypto === true) {
      query.gameId = {
        [Op.in]: [DEFAULT_GAME_ID.ROLLER_COASTER, DEFAULT_GAME_ID.CRYPTO_FUTURES]
      }
    } else {
      query.gameId = { [Op.notIn]: [DEFAULT_GAME_ID.ROLLER_COASTER, DEFAULT_GAME_ID.CRYPTO_FUTURES] }
    }

    const transactionsDetails = await TransactionModel.findAndCountAll({
      where: query,
      attributes: ['betId', 'gameId',
        [sequelize.literal('sum(case when transaction_type = \'win\' then amount else 0 end)'), 'win'],
        [sequelize.literal('sum(case when transaction_type = \'bet\' then amount else 0 end)'), 'bet'],
        [sequelize.literal('max(CASE WHEN transaction_type = \'bet\' THEN "Transaction"."created_at" END)'), 'betCreatedAt']
      ],
      include: [
        { model: UserModel, attributes: ['userName'], as: 'user' },
        { model: GameModel, attributes: ['name'], as: 'game' },
        ...(isCrypto
          ? [{
              model: CryptoFuturesBetModel,
              attributes: [],
              required: false,
              as: 'cryptoFuturesBet',
              include: {
                attributes: ['symbol'],
                model: CryptoFuturesInstrumentModel,
                as: 'instrument',
                required: false
              }
            }]
          : [])

      ],
      // raw: true,
      // nest: true,
      limit,
      offset,
      order: [
        [sequelize.literal('max(CASE WHEN transaction_type = \'bet\' THEN "Transaction"."created_at" END)'), 'DESC']
      ],
      group: ['betId', 'gameId', 'game.id', 'user.id', ...(isCrypto ? ['cryptoFuturesBet.instrument.symbol', 'cryptoFuturesBet.instrument.id'] : [])],
      transaction: sequelizeTransaction
    })

    return {
      count: transactionsDetails.count.length,
      rows: transactionsDetails.rows
    }
  }
}

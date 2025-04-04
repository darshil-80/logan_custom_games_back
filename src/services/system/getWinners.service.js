import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { TRANSACTION_TYPES } from '../../libs/constants'
import { dateOptionsFilter } from '../../utils/common.utils'
import { Op } from 'sequelize'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    page: { type: 'string' },
    dateOptions: {
      type: ['string', 'null'],
      enum: ['day', 'week', 'month']
    }
  },
  required: ['dateOptions']
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
    let { limit, page, dateOptions } = this.args
    const {
      dbModels: {
        CasinoTransaction: CasinoTransactionModel,
        User: UserModel,
        CasinoGame: CasinoGameModel
      }
    } = this.context

    limit = (parseInt(limit)) ? parseInt(limit) : 15
    page = (parseInt(page)) ? parseInt(page) : 1
    let query =
    {
      actionType: TRANSACTION_TYPES.EAR_WIN,
      amount: {
        [Op.gt]: 0
      }
    }
    query = dateOptionsFilter(query, dateOptions)
    console.log('query', query)

    try {
      const winners = await CasinoTransactionModel.findAndCountAll({
        where: query,
        limit,
        include: [
          {
            model: UserModel,
            as: 'user',
            required: true,
            attributes: ['firstName', 'lastName', 'userName']
          },
          {
            model: CasinoGameModel,
            as: 'casino',
            attributes: ['casinoGameId', 'gameName', 'title', 'image', 'hasDemo', 'id']
          }
        ],
        attributes: ['amount', 'casinoGameId'],
        offset: ((page - 1) * limit),
        order: [['amount', 'DESC']]
      })
      return { winners }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

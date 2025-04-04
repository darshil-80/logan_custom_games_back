import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'
import moment from 'moment'
import { omitBy, isNil } from 'lodash'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' },
    search: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    promotionId: { type: 'string' },
    status: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

export default class GetPromotionService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Promotion: PromotionModel
      },
      sequelizeTransaction
    } = this.context

    const { promotionId, limit, offset, search, startDate, endDate, status } = this.args

    const whereCondition = {
      title: (search) ? { [Op.iLike]: `${search}%` } : null,
      status: (status) || true,
      createdAt: (startDate && endDate) ? { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } : null
    }

    const filterCondition = omitBy(whereCondition, isNil)

    if (promotionId) {
      const promotionDetails = await PromotionModel.findOne({
        where: { id: promotionId },
        transaction: sequelizeTransaction
      })

      if (!promotionDetails) this.addError('PromotionNotFoundErrorType')
      else return { count: 1, rows: [promotionDetails] }
    } else {
      const promotionDetails = await PromotionModel.findAndCountAll({
        where: filterCondition,
        order: [['id', 'desc']],
        limit: limit || null,
        offset: offset || 0,
        transaction: sequelizeTransaction
      })

      if (!promotionDetails) this.addError('PromotionNotFoundErrorType')
      else return { count: promotionDetails.count, rows: promotionDetails.rows }
    }
  }
}

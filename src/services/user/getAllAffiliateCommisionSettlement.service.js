import _ from 'lodash'
import { Op } from 'sequelize'
import ajv from '../../libs/ajv'
import moment from 'moment'
import ServiceBase from '../../libs/serviceBase'
import { AFFILIATE_STATUS } from '../../libs/constants'

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
 * Provides service to show all affiliates settlement details
 * @export
 * @class GetAllAffiliatesSettlementService
 * @extends {ServiceBase}
 */
export default class GetAllAffiliatesSettlementService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Affiliate: AffiliateModel,
        AffiliateSettlement: AffiliateSettlementModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const { offset, limit, startDate, endDate } = this.args

    const affiliateDetails = await AffiliateModel.findOne({ where: { ownerId: userId, status: AFFILIATE_STATUS.ACTIVE } }, { transaction: sequelizeTransaction })
    if (!affiliateDetails) return { message: 'No referral user found' }
    const whereCondition = {
      ...((startDate && endDate)
        ? { createdAt: { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } }
        : {}),
      affiliateId: affiliateDetails.id
    }

    const filterAffiliate = _.omitBy(whereCondition, _.isNil)

    try {
      const affiliates = await AffiliateSettlementModel.findAndCountAll({
        where: filterAffiliate,
        include: [
          {
            model: AffiliateModel,
            where: { status: 'ACTIVE' },
            required: true,
            as: 'affiliates'
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        transaction: sequelizeTransaction
      })

      return {
        count: affiliates.count,
        rows: affiliates.rows.map(affiliate => affiliate?.toJSON()) || []
      }
    } catch (error) {
      console.log(error)
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

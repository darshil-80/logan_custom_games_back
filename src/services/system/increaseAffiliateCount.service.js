import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import { AFFILIATE_STATUS } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    affiliateCode: { type: 'string' }
  },
  required: ['affiliateCode']
}

const constraints = ajv.compile(schema)

export default class IncreaseAffiliateCountService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Affiliate: AffiliateModel,
        AffiliateStats: AffiliateStatsModel
      },
      sequelizeTransaction
    } = this.context

    const affiliateCode = this.args.affiliateCode

    try {
      const affiliate = await AffiliateModel.findOne({
        where: {
          code: affiliateCode,
          status: AFFILIATE_STATUS.ACTIVE
        },
        include:
        [{
          model: AffiliateStatsModel,
          required: true,
          as: 'affiliateStats'
        }],
        paranoid: false,
        transaction: sequelizeTransaction
      })

      if (!affiliate) {
        return this.addError(
          'InvalidAffiliateCodeErrorType',
          `affiliateCode: ${affiliateCode} not found`
        )
      }

      affiliate.affiliateStats.totalClicks += 1
      await affiliate.affiliateStats.save({ transaction: sequelizeTransaction })

      return {
        message: 'Affiliate Count increased'
      }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

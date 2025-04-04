import ServiceBase from '../../libs/serviceBase'
import config from '../../configs/app.config'
import ajv from '../../libs/ajv'

const schema = {
  type: 'object',
  properties: {
    affiliateCode: { type: 'string' }
  },
  required: ['affiliateCode']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to create new affiliate
 * @export
 * @class CreateAffiliateService
 * @extends {ServiceBase}
 */
export default class CreateAffiliateService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        Affiliate: AffiliateModel,
        User: UserModel,
        AffiliateStats: AffiliateStatsModel,
        AffiliateCommisionSetting: AffiliateCommisionSettingModel
      },
      sequelizeTransaction,
      auth: { id: userId }
    } = this.context

    const { affiliateCode } = this.args

    const affiliate = await AffiliateModel.findOne({
      where: { code: affiliateCode },
      transaction: sequelizeTransaction
    })

    if (affiliate) {
      return this.addError('AffiliatesAlreadyExistsErrorType', `affiliateCode: ${affiliateCode} already exists`)
    }

    const url = `${config.get('user_frontend_app_url')}/signup?affiliateCode=${affiliateCode}`
    // FIXME: create new short url key
    // const apiKey = config.get('short_url.api_key')
    // const cuttlyURL = `https://cutt.ly/api/api.php?key=${apiKey}&short=${url}`
    // const { data: { url: { shortLink } } } = await axios.get(cuttlyURL)

    const affiliatesObj = {
      url: url,
      code: affiliateCode,
      ownerId: userId,
      ownerType: 'USER',
      affiliateStats: {},
      affiliateCommision: {
        profitCommisionPercentage: 1,
        wageredCommisionPercentage: 1
      }
    }

    try {
      const newAffiliate = await AffiliateModel.create(affiliatesObj, {
        include: [
          {
            model: AffiliateStatsModel,
            as: 'affiliateStats'
          },
          {
            model: AffiliateCommisionSettingModel,
            as: 'affiliateCommision'
          }
        ],
        transaction: sequelizeTransaction
      })

      await UserModel.update({ affiliateId: newAffiliate.id }, { where: { id: userId }, transaction: sequelizeTransaction })

      return {
        message: 'Referral Code Created Successfully',
        affiliate: newAffiliate.url
      }
    } catch (e) {
      return this.addError('SomethingWentWrongErrorType', 'Affiliate Creation failed')
    }
  }
}

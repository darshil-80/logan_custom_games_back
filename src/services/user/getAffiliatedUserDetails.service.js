import { AFFILIATE_STATUS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show associated users of given affiliate code
 * @export
 * @class GetAffiliatedUsersService
 * @extends {ServiceBase}
 */
export default class GetAffiliatedUsersService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        User: UserModel,
        Affiliate: AffiliateModel
      },
      auth: { id: userId }
    } = this.context

    const affiliateDetails = await AffiliateModel.findOne({
      where: { ownerId: userId, status: AFFILIATE_STATUS.ACTIVE }
    })
    if (!affiliateDetails) return { message: 'No referral user found' }

    const affiliateUsers = await UserModel.findAll({
      where: { affiliatedBy: affiliateDetails.code },
      attributes: [
        'id', 'userName', 'email', 'active', 'createdAt'
      ],
      order: [['id', 'ASC']]
    })
    const totalAffiliatedCount = affiliateUsers?.length

    return {
      affiliateUsers,
      totalAffiliatedCount
    }
  }
}

import { BONUS_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show user active Referral bonus
 * @export
 * @class GetReferralBonusService
 * @extends {ServiceBase}
 */
export default class GetReferralBonusService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel
      }
    } = this.context

    const userBonus = await UserBonusModel.findAll({
      where: {
        userId: this.context.auth.id,
        bonusType: BONUS_TYPES.REFERRAL
      }
    })

    return userBonus
  }
}

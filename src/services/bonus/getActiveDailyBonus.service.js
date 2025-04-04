import { BONUS_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show all daily bonus details
 * @export
 * @class GetActiveDailyBonusService
 * @extends {ServiceBase}
 */
export default class GetDailyBonusDetailsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        Bonus: BonusModel
      },
      sequelizeTransaction
    } = this.context

    try {
      const dailyBonuses = await BonusModel.findOne({
        where: { active: true, bonusType: BONUS_TYPES.DAILY },
        order: [['createdAt', 'DESC']],
        transaction: sequelizeTransaction
      })

      return { dailyBonuses: dailyBonuses.toJSON() }
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

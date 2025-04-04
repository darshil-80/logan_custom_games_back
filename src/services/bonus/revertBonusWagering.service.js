import { BONUS_STATUS, WAGERING_STATUS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import { minus } from 'number-precision'

/**
 * Provides service to revert bonus wagering
 * @export
 * @class RevertBonusWageringService
 * @extends {ServiceBase}
 */
export default class RevertBonusWageringService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel
      },
      sequelizeTransaction
    } = this.context

    const { userId, betAmount } = this.args

    const userActiveBonus = await UserBonusModel.findOne({
      where: { userId, status: BONUS_STATUS.ACTIVE, wageringStatus: WAGERING_STATUS.ACTIVE },
      transaction: sequelizeTransaction
    })

    if (!userActiveBonus) { return }

    try {
      // minus wageredAmount with user's bet amount
      userActiveBonus.wageredAmount = minus(userActiveBonus.wageredAmount, betAmount)
      await userActiveBonus.save({ transaction: sequelizeTransaction })
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

import { BONUS_STATUS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'

/**
 * Provides service to show user bonus details
 * @export
 * @class GetUserBonusDetails
 * @extends {ServiceBase}
 */
export default class GetUserBonusDetailsService extends ServiceBase {
  async run () {
    const {
      dbModels: { UserBonus: UserBonusModel, Bonus: BonusModel },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    try {
      await UserBonusModel.update(
        { status: BONUS_STATUS.EXPIRED },
        {
          where: {
            expiresAt: {
              [Op.lt]: new Date()
            },
            userId
          }
        }
      )

      await UserBonusModel.update(
        { status: BONUS_STATUS.READY_TO_CLAIM },
        {
          where: {
            readyToClaimAt: {
              [Op.lt]: new Date()
            },
            status: BONUS_STATUS.ACTIVE,
            userId
          }
        }
      )

      const userbonusDetails = await UserBonusModel.findAll({
        where: { userId },
        include:
        [{
          model: BonusModel,
          required: false,
          as: 'bonus'
        }],
        transaction: sequelizeTransaction
      })

      return {
        userbonusDetails: userbonusDetails.map(userbonusDetail => userbonusDetail?.toJSON()) || []
      }
    } catch (error) {
      console.log(error)
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

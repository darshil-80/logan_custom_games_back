import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'
import moment from 'moment'
// import { BONUS_STATUS } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service for user to claim daily bonus amount
 * @export
 * @class ClaimDailyBonusAmountService
 * @extends {ServiceBase}
 */
export default class GetSplitBonusService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const { startDate, endDate } = this.args

    const userBonus = await UserBonusModel.findAll({
      where: {
        userId,
        // status: { [Op.notIn]: [BONUS_STATUS.ACTIVE] },
        readyToClaimAt: (startDate && endDate)
          ? { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] }
          : null
      },
      transaction: sequelizeTransaction
    })

    if (!userBonus || userBonus.length === 0) { return { groupedBonuses: {} } }

    const groupedBonuses = {}

    userBonus.forEach(bonus => {
      const readyToClaimAt = moment(bonus.readyToClaimAt).format('YYYY-MM-DD')
      if (!groupedBonuses[readyToClaimAt]) {
        groupedBonuses[readyToClaimAt] = []
      }
      groupedBonuses[readyToClaimAt].push(bonus)
    })

    return { groupedBonuses }
  }
}

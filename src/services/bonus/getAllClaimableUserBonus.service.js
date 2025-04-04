import { BONUS_STATUS, BONUS_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

export default class GetUserAllRewardsDetailsService extends ServiceBase {
  async run () {
    const {
      dbModels: { UserBonus: UserBonusModel, Bonus: BonusModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    try {
      const bonuses = []
      const bonusTypeStatuses = [
        { bonusType: BONUS_TYPES.CASHBACK, status: BONUS_STATUS.READY_TO_CLAIM, order: 1 },
        { bonusType: BONUS_TYPES.DAILY, status: BONUS_STATUS.READY_TO_CLAIM, order: 2 },
        { bonusType: BONUS_TYPES.WEEKLY, status: BONUS_STATUS.READY_TO_CLAIM, order: 3 },
        { bonusType: BONUS_TYPES.OTHER, status: BONUS_STATUS.READY_TO_CLAIM, order: 4 },
        { bonusType: BONUS_TYPES.WEEKLY_SPLITTED, status: BONUS_STATUS.READY_TO_CLAIM, order: 5 },
        { bonusType: BONUS_TYPES.REGISTRATION, status: BONUS_STATUS.READY_TO_CLAIM, order: 6 },
        { bonusType: BONUS_TYPES.DEPOSIT, status: BONUS_STATUS.READY_TO_CLAIM, order: 7 }
      ]

      await Promise.all(
        bonusTypeStatuses.map(async ({ bonusType, status, order }) => {
          let bonusAmount = 0
          let bonusId = 0
          let termsAndConditions, description
          let userBonusId = null
          let wageringStatus = null
          let amountToWager = null
          let wageredAmount = null

          const bonusInfo = await BonusModel.findOne({
            where: { bonusType },
            attributes: ['id', 'termsAndConditions', 'description']
          })

          if (bonusInfo) {
            bonusId = bonusInfo.id
            termsAndConditions = bonusInfo.termsAndConditions
            description = bonusInfo.description
          }

          const userBonusDetails = await UserBonusModel.findOne({
            where: { bonusType, userId }, // Fetching based on the current bonusType
            attributes: ['id', 'wageringStatus', 'wageredAmount', 'amountToWager']
          })

          userBonusId = userBonusDetails?.id || null // Assign id if userBonusDetails exists, else null
          wageringStatus = userBonusDetails?.wageringStatus || null
          wageredAmount = userBonusDetails?.wageredAmount || null
          amountToWager = userBonusDetails?.amountToWager || null

          if (bonusType === BONUS_TYPES.WEEKLY || bonusType === BONUS_TYPES.WEEKLY_SPLITTED) {
            const [weekly, weeklySplitted] = await Promise.all([
              UserBonusModel.sum('bonus_amount', {
                where: { userId, status: BONUS_STATUS.READY_TO_CLAIM, bonusType: BONUS_TYPES.WEEKLY },
                transaction: sequelizeTransaction
              }),
              UserBonusModel.sum('bonus_amount', {
                where: {
                  userId,
                  status: BONUS_STATUS.READY_TO_CLAIM,
                  bonusType: BONUS_TYPES.WEEKLY_SPLITTED
                },
                transaction: sequelizeTransaction
              })
            ])

            bonusAmount = (weekly || 0) + (weeklySplitted || 0)
          } else {
            bonusAmount = (
              await UserBonusModel.sum('bonus_amount', { where: { userId, status, bonusType }, transaction: sequelizeTransaction })
            ) || 0
          }
          bonuses.push({ bonusType, status, bonusAmount, bonusId, termsAndConditions, description, order, userBonusId, wageringStatus, wageredAmount, amountToWager })
        })
      )
      bonuses.sort((a, b) => a.order - b.order)
      return bonuses
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

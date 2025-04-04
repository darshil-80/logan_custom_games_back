import { plus } from 'number-precision'
import { BONUS_STATUS, BONUS_TYPES, EAR_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show user bonus details
 * @export
 * @class GetUserBonusDetails
 * @extends {ServiceBase}
 */
export default class GetUserAllRewardsDetailsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel,
        CasinoTransaction: CasinoTransactionModel,
        SportBettingTransaction: SportBettingTransactionModel,
        Transaction: TransactionModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    try {
      const totalDailyBonus = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId,
          status: BONUS_STATUS.CLAIMED,
          bonusType: BONUS_TYPES.DAILY
        },
        transaction: sequelizeTransaction
      })) || 0

      const totalPendingRewards = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId,
          status: BONUS_STATUS.READY_TO_CLAIM
        },
        transaction: sequelizeTransaction
      })) || 0

      const totalCashback = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId,
          status: BONUS_STATUS.CLAIMED,
          bonusType: BONUS_TYPES.CASHBACK
        },
        transaction: sequelizeTransaction
      })) || 0

      const otherBonuses = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId,
          status: BONUS_STATUS.CLAIMED,
          bonusType: BONUS_TYPES.OTHER
        },
        transaction: sequelizeTransaction
      })) || 0

      const totalWeeklyBonus = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId,
          status: BONUS_STATUS.CLAIMED,
          bonusType: [BONUS_TYPES.WEEKLY, BONUS_TYPES.WEEKLY_SPLITTED]
        },
        transaction: sequelizeTransaction
      })) || 0

      const totalRewarded = plus(totalWeeklyBonus, totalDailyBonus, totalCashback, otherBonuses)

      const totalCasinoBet = await CasinoTransactionModel.sum('amount', {
        where: {
          transactionType: EAR_TRANSACTION_TYPE.DEBIT,
          actioneeId: userId
        }
      }) || 0

      const totalCustomBet = await TransactionModel.sum('amount', {
        where: {
          transactionType: TRANSACTION_TYPES.BET,
          status: TRANSACTION_STATUS.SUCCESS,
          actioneeId: userId

        }
      }) || 0

      const totalSportBookBet = await SportBettingTransactionModel.sum('amount', {
        where: {
          actionType: TRANSACTION_TYPES.BET,
          actioneeId: userId
        },
        transaction: sequelizeTransaction
      }) || 0

      const totalWager = plus(totalCasinoBet, totalCustomBet, totalSportBookBet)

      return {
        totalDailyBonus, totalWeeklyBonus, totalRewarded, totalWager, totalPendingRewards, totalCashback, otherBonuses
      }
    } catch (error) {
      console.log(error)
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

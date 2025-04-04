import { BONUS_STATUS, BONUS_TYPES, PAYMENT_METHODS, TRANSACTION_STATUS, USER_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'
import { plus, minus } from 'number-precision'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import { isDateInFuture } from '../../utils/date.utils'
import BonusEmitter from '../../socket-resources/emitters/bonus.emitter'

/**
 * Provides service for user to claim daily bonus amount
 * @export
 * @class ClaimDailyBonusAmountService
 * @extends {ServiceBase}
 */
export default class ClaimAllUserBonusAmountService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel,
        PaymentTransaction: PaymentTransactionModel,
        Wallet: WalletModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction, sequelize
    } = this.context

    const { bonusType } = this.args
    let whereCondition

    if (bonusType === BONUS_TYPES.WEEKLY) {
      whereCondition = {
        userId,
        status: BONUS_STATUS.READY_TO_CLAIM,
        claimedCount: 0,
        [Op.or]: [
          { bonusType: BONUS_TYPES.WEEKLY },
          { bonusType: BONUS_TYPES.WEEKLY_SPLITTED }
        ]
      }
    } else {
      whereCondition = {
        userId,
        status: BONUS_STATUS.READY_TO_CLAIM,
        // claimedCount: 0,
        bonusType
      }
    }

    const userBonus = (await UserBonusModel.sum('bonus_amount', {
      where: whereCondition,
      transaction: sequelizeTransaction
    })) || 0

    if (!userBonus) {
      return this.addError('UserHasNoBonusAmountToClaimErrorType')
    }

    if (userBonus?.expiresAt && !isDateInFuture(userBonus.expiresAt)) {
      return this.addError('BonusExpiredErrorType')
    }

    const userWallet = await WalletModel.findOne({
      where: { ownerId: userId, primary: true },
      transaction: sequelizeTransaction
    })

    try {
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      if (bonusType === BONUS_TYPES.DEPOSIT || bonusType === BONUS_TYPES.REGISTRATION) {
        // Add bonus to the main wallet amount and subtract it from the bonus balance
        userWallet.amount = plus(userWallet.amount, userBonus)
        userWallet.bonusBalance = minus(userWallet.bonusBalance, userBonus)
      } else if (bonusType === BONUS_TYPES.OTHER) {
        // For OTHER bonus types, update nonCashAmount
        userWallet.nonCashAmount = plus(userWallet.nonCashAmount, userBonus)
      } else {
        // For any other types, just add the bonus to the main amount
        userWallet.amount = plus(userWallet.amount, userBonus)
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      const bonusTransactionObj = {
        actioneeType: USER_TYPES.USER,
        actioneeId: userId,
        amount: userBonus,
        status: TRANSACTION_STATUS.SUCCESS,
        transactionType: bonusType,
        targetWalletId: userWallet.id,
        currencyId: userWallet.currencyId,
        paymentMethod: PAYMENT_METHODS.BONUS
      }

      const bonusTransaction = await PaymentTransactionModel.create(bonusTransactionObj, { transaction: sequelizeTransaction })

      if (userBonus > 0) {
        await UserBonusModel.update(
          { status: BONUS_STATUS.CLAIMED, transactionId: bonusTransaction.transactionId, claimedCount: +1, claimedAt: new Date() }, // Set status to 'completed'
          {
            where: whereCondition,
            transaction: sequelizeTransaction
          }
        )
      }

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      const totalPendingRewards = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId,
          status: BONUS_STATUS.READY_TO_CLAIM
        },
        transaction: sequelizeTransaction
      })) || 0

      const bonusSums = await UserBonusModel.findAll({
        attributes: [
          [sequelize.literal(`SUM(CASE WHEN bonus_type = '${BONUS_TYPES.DAILY}' THEN bonus_amount ELSE 0 END)`), 'totalDailyBonus'],
          [sequelize.literal(`SUM(CASE WHEN bonus_type = '${BONUS_TYPES.CASHBACK}' THEN bonus_amount ELSE 0 END)`), 'totalCashback'],
          [sequelize.literal(`SUM(CASE WHEN bonus_type = '${BONUS_TYPES.OTHER}' THEN bonus_amount ELSE 0 END)`), 'otherBonuses'],
          [sequelize.literal(`SUM(CASE WHEN bonus_type IN ('${BONUS_TYPES.WEEKLY}', '${BONUS_TYPES.WEEKLY_SPLITTED}') THEN bonus_amount ELSE 0 END)`), 'totalWeeklyBonus']
        ],
        where: {
          userId,
          status: BONUS_STATUS.CLAIMED
        },
        raw: true,
        transaction: sequelizeTransaction
      })

      const userBonusDetail = bonusSums[0]

      const totalRewarded = plus(userBonusDetail.totalWeeklyBonus, userBonusDetail.totalDailyBonus, userBonusDetail.totalCashback, userBonusDetail.otherBonuses)

      BonusEmitter.emitBonus({ totalPendingRewards, totalRewarded, ...userBonusDetail }, userId)

      return { userBonus, message: 'user has successfully claimed bonus amount' }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

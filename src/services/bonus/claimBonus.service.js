import { BONUS_STATUS, BONUS_TYPES, PAYMENT_METHODS, TRANSACTION_STATUS, USER_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import { plus } from 'number-precision'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import { isDateInFuture } from '../../utils/date.utils'
import BonusEmitter from '../../socket-resources/emitters/bonus.emitter'

/**
 * Provides service for user to claim daily bonus amount
 * @export
 * @class ClaimDailyBonusAmountService
 * @extends {ServiceBase}
 */
export default class ClaimUserBonusAmountService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel,
        Bonus: BonusModel,
        Currency: CurrencyModel,
        PaymentTransaction: PaymentTransactionModel,
        Wallet: WalletModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction, sequelize
    } = this.context

    const { bonusId, bonusType } = this.args

    const userBonus = await UserBonusModel.findOne({
      where: { userId, id: bonusId, status: BONUS_STATUS.READY_TO_CLAIM, bonusType, claimedCount: 0 },
      include: [
        {
          model: BonusModel,
          required: false,
          as: 'bonus'
        }
      ],
      transaction: sequelizeTransaction
    })

    if (!userBonus) { return this.addError('UserHasNoBonusAmountToClaimErrorType') }

    if (userBonus?.expiresAt && (!isDateInFuture(userBonus.expiresAt))) {
      return this.addError('BonusExpiredErrorType')
    }

    const currency = await CurrencyModel.findOne({
      where: { code: userBonus.bonus.currencyCode },
      transaction: sequelizeTransaction
    })

    const userWallet = await WalletModel.findOne({
      where: { ownerId: userId, currencyId: currency.id },
      transaction: sequelizeTransaction
    })
    // const userWallet = user.wallets?.length ? user.wallets[0] : null
    try {
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      // if ((bonusType === BONUS_TYPES.DEPOSIT) || (bonusType === BONUS_TYPES.REGISTRATION)) {
      //   userWallet.amount = plus(userWallet.amount, userBonus.bonusAmount)
      //   userWallet.bonusBalance = minus(userWallet.bonusBalance, userBonus.bonusAmount)
      // }

      if ((bonusType === BONUS_TYPES.REFERRAL) || (bonusType === BONUS_TYPES.WEEKLY_SPLITTED) || (bonusType === BONUS_TYPES.CASHBACK)) {
        userWallet.amount = plus(userWallet.amount, userBonus.bonusAmount)
      } else if (bonusType === BONUS_TYPES.OTHER) {
        userWallet.nonCashAmount = plus(userWallet.nonCashAmount, userBonus.bonusAmount)
      } else {
        userWallet.amount = plus(userWallet.amount, userBonus.directBonusAmount)
      // userWallet.nonCashAmount = minus(userWallet.nonCashAmount, wageredUserBonus.bonusAmount)
      }
      await userWallet.save({ transaction: sequelizeTransaction })

      const bonusTransactionObj = {
        actioneeType: USER_TYPES.USER,
        actioneeId: userId,
        amount: userBonus.directBonusAmount,
        status: TRANSACTION_STATUS.SUCCESS,
        transactionType: bonusType,
        targetWalletId: userWallet.id,
        currencyId: userWallet.currencyId,
        paymentMethod: PAYMENT_METHODS.BONUS
      }

      const bonusTransaction = await PaymentTransactionModel.create(bonusTransactionObj, { transaction: sequelizeTransaction })

      userBonus.status = BONUS_STATUS.CLAIMED
      userBonus.claimedCount = +1
      userBonus.claimedAt = new Date()
      userBonus.transactionId = bonusTransaction.transactionId

      await userBonus.save({ transaction: sequelizeTransaction })

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

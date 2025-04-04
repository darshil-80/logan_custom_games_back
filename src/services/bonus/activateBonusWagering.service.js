import { minus } from 'number-precision'
import { BONUS_STATUS, WAGERING_STATUS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to activate bonus wagering
 * @export
 * @class ActivateBonusWageringService
 * @extends {ServiceBase}
 */
export default class ActivateBonusWageringService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel,
        Wallet: WalletModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    const { bonusId } = this.args

    const activeBonus = await UserBonusModel.findOne({
      where: { userId, status: BONUS_STATUS.ACTIVE, wageringStatus: WAGERING_STATUS.ACTIVE },
      transaction: sequelizeTransaction
    })

    if (activeBonus) {
      return this.addError('UserHasAlreadyActivatedBonusWageringErrorType', 'User Has Already Activated Bonus Wagering')
    }

    const wagerBonus = await UserBonusModel.findOne({
      where: { id: bonusId, userId, status: BONUS_STATUS.ACTIVE, wageringStatus: WAGERING_STATUS.PENDING },
      transaction: sequelizeTransaction
    })

    if (!wagerBonus) { return this.addError('UserHasNoActiveBonusErrorType', 'User Has No Active Bonus') }

    const userWallet = await WalletModel.findOne({
      where: { ownerId: userId },
      transaction: sequelizeTransaction
    })

    try {
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      const currentDate = new Date()
      if (minus(wagerBonus.expiresAt, currentDate) < 0) {
        wagerBonus.status = BONUS_STATUS.EXPIRED
        wagerBonus.wageringStatus = WAGERING_STATUS.REJECTED
        await wagerBonus.save({ transaction: sequelizeTransaction })

        userWallet.bonusBalance = minus(userWallet.bonusBalance, wagerBonus.bonusAmount)
        await userWallet.save({ transaction: sequelizeTransaction })

        return this.addError('BonusExpiredErrorType', 'bonus is expired')
      }

      wagerBonus.wageringStatus = WAGERING_STATUS.ACTIVE
      wagerBonus.claimedCount = 1
      await wagerBonus.save({ transaction: sequelizeTransaction })

      return {
        message: `You have successfully Activated Wagering of ${wagerBonus.bonusType} bonus`
      }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

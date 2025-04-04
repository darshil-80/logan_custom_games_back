import { plus, times } from 'number-precision'
import ServiceBase from '../../libs/serviceBase'

import {
  BONUS_STATUS,
  BONUS_TYPES,
  WAGERING_STATUS,
  REGISTRATION_BONUS_STATUS
} from '../../libs/constants'

/**
 * Provides the service to add registration bonus amount
 * @export
 * @class DistributeRegistrationBonus
 * @extends {ServiceBase}
 */
export default class DistributeRegistrationBonusService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        Bonus: BonusModel,
        Wallet: WalletModel,
        UserBonus: UserBonusModel
      },
      sequelizeTransaction
    } = this.context

    const { userWalletId, userId } = this.args

    const userWallet = await WalletModel.findOne({
      where: { id: userWalletId, ownerId: userId },
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
      transaction: sequelizeTransaction
    })

    const newUserBonus = await BonusModel.findOne({
      where: { active: REGISTRATION_BONUS_STATUS.TRUE, bonusType: BONUS_TYPES.REGISTRATION },
      transaction: sequelizeTransaction
    })

    if (!newUserBonus) { return this.addError('BonusNotExistsErrorType', 'Bonus Not Found') }

    const bonusAmount = +newUserBonus.joiningBonusAmount

    await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })
    await userWallet.update({ bonusBalance: plus(+userWallet.bonusBalance, bonusAmount) }, {
      transaction: sequelizeTransaction
    })

    // const bonusTransactionObj = {
    //   actioneeType: USER_TYPES.USER,
    //   actioneeId: userId,
    //   amount: bonusAmount,
    //   status: TRANSACTION_STATUS.SUCCESS,
    //   transactionType: TRANSACTION_TYPES.BONUS_DEPOSIT,
    //   targetWalletId: userWalletId,
    //   currencyId: userWallet.currencyId,
    //   paymentMethod: PAYMENT_METHODS.BONUS
    // }

    // const bonusTransaction = await PaymentTransactionModel.create(bonusTransactionObj, { transaction: sequelizeTransaction })

    await UserBonusModel.create({
      status: BONUS_STATUS.ACTIVE,
      wageringStatus: WAGERING_STATUS.PENDING,
      amountToWager: times(bonusAmount, +newUserBonus.wageringMultiplier),
      expiresAt: new Date(new Date().getTime() + (newUserBonus.daysToClear * 24 * 60 * 60 * 1000)),
      bonusAmount,
      userId,
      bonusId: newUserBonus.id,
      bonusType: BONUS_TYPES.REGISTRATION
      // transactionId: bonusTransaction.transactionId
    },
    {
      transaction: sequelizeTransaction
    })
  }
}

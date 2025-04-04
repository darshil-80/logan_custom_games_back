import { plus, divide, times } from 'number-precision'
import ServiceBase from '../../libs/serviceBase'

import {
  // PAYMENT_METHODS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  // USER_TYPES,
  DEPOSIT_BONUS_STATUS,
  NO_OF_DEPOSITS,
  BONUS_TYPES,
  BONUS_STATUS,
  WAGERING_STATUS
} from '../../libs/constants'

/**
 * Provides the service to distribute deposit bonus
 * @export
 * @class DistributeDepositBonus
 * @extends {ServiceBase}
 */
export default class DistributeDepositBonusService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        PaymentTransaction: PaymentTransactionModel,
        Bonus: BonusModel,
        Wallet: WalletModel,
        UserBonus: UserBonusModel
      },
      sequelizeTransaction
    } = this.context

    const { wallet, callbackAmount } = this.args

    const {
      // id: walletId,
      ownerId: userId,
      // currencyId,
      bonusBalance
    } = wallet

    // check for bonus and update the bonus
    const depositBonus = await BonusModel.findOne({
      where: { active: DEPOSIT_BONUS_STATUS.TRUE, bonusType: BONUS_TYPES.DEPOSIT },
      transaction: sequelizeTransaction
    })

    const transactionExist = await PaymentTransactionModel.findAll({
      where: {
        actioneeId: userId,
        transactionType: TRANSACTION_TYPES.DEPOSIT,
        status: TRANSACTION_STATUS.SUCCESS
      },
      transaction: sequelizeTransaction
    })

    let bonusAmount
    let amount

    //  if bonus is active and only on first deposit
    if (depositBonus && transactionExist.length === 1) {
      // calculate the bonus amount
      if (callbackAmount < Number(depositBonus.minDeposit)) {
        bonusAmount = 0.0
      } else {
        amount = times(callbackAmount, divide(depositBonus.bonusPercent[NO_OF_DEPOSITS.DEPOSIT_1], 100))
      }
    }

    if (depositBonus && transactionExist.length === 2) {
      // calculate the bonus amount
      if (callbackAmount < Number(depositBonus.minDeposit)) {
        bonusAmount = 0.0
      } else {
        amount = times(callbackAmount, divide(depositBonus.bonusPercent[NO_OF_DEPOSITS.DEPOSIT_2], 100))
      }
    }

    if (depositBonus && transactionExist.length === 3) {
      // calculate the bonus amount
      if (callbackAmount < Number(depositBonus.minDeposit)) {
        bonusAmount = 0.0
      } else {
        amount = times(callbackAmount, divide(depositBonus.bonusPercent[NO_OF_DEPOSITS.DEPOSIT_3], 100))
      }
    }

    bonusAmount = amount > depositBonus.maxDepositBonusAmount ? Number(depositBonus.maxDepositBonusAmount) : amount

    // update wallet with bonusBalance
    await wallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })
    await wallet.update({ bonusBalance: plus(bonusBalance, bonusAmount) }, {
      transaction: sequelizeTransaction
    })

    // // create Transaction for bonus
    // const bonusTransactionObj = {
    //   actioneeType: USER_TYPES.USER,
    //   actioneeId: userId,
    //   amount: bonusAmount,
    //   status: TRANSACTION_STATUS.SUCCESS,
    //   transactionType: TRANSACTION_TYPES.BONUS_DEPOSIT,
    //   targetWalletId: walletId,
    //   currencyId: currencyId,
    //   paymentMethod: PAYMENT_METHODS.BONUS
    // }

    // const bonusTransaction = await PaymentTransactionModel.create(bonusTransactionObj, { transaction: sequelizeTransaction })

    await UserBonusModel.create({
      status: BONUS_STATUS.ACTIVE,
      wageringStatus: WAGERING_STATUS.PENDING,
      amountToWager: times(bonusAmount, Number(depositBonus.wageringMultiplier)),
      bonusAmount,
      expiresAt: new Date(new Date().getTime() + (depositBonus.daysToClear * 24 * 60 * 60 * 1000)),
      userId,
      bonusId: depositBonus.id,
      bonusType: BONUS_TYPES.DEPOSIT
      // transactionId: bonusTransaction.transactionId
    },
    {
      transaction: sequelizeTransaction
    })
  }
}

import { BONUS_STATUS, WAGERING_STATUS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import { minus, plus } from 'number-precision'
// import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import WageringEmitter from '../../socket-resources/emitters/wagering.emitter'

/**
 * Provides service to handle bonus wagering
 * @export
 * @class HandleBonusWageringService
 * @extends {ServiceBase}
 */
export default class HandleBonusWageringService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        UserBonus: UserBonusModel,
        Wallet: WalletModel
      },
      sequelizeTransaction
    } = this.context

    const { userId, userWalletId, betAmount } = this.args

    const userActiveBonus = await UserBonusModel.findOne({
      where: { userId, status: BONUS_STATUS.ACTIVE, wageringStatus: WAGERING_STATUS.ACTIVE },
      transaction: sequelizeTransaction
    })

    if (!userActiveBonus) { return }

    const userWallet = await WalletModel.findOne({
      where: { id: userWalletId, ownerId: userId },
      transaction: sequelizeTransaction
    })

    try {
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      // checking user's active bonus is expired or not
      const currentDate = new Date()
      if (minus(userActiveBonus.expiresAt, currentDate) < 0) {
        userActiveBonus.status = BONUS_STATUS.EXPIRED
        userActiveBonus.wageringStatus = WAGERING_STATUS.REJECTED
        await userActiveBonus.save({ transaction: sequelizeTransaction })

        userWallet.bonusBalance = minus(userWallet.bonusBalance, userActiveBonus.bonusAmount)
        await userWallet.save({ transaction: sequelizeTransaction })

        return this.addError('BonusExpiredErrorType', 'bonus is expired')
      }

      if (userActiveBonus.amountToWager > userActiveBonus.wageredAmount) {
        // adding wageredAmount with user's bet amount
        userActiveBonus.wageredAmount = plus(userActiveBonus.wageredAmount, betAmount)
        await userActiveBonus.save({ transaction: sequelizeTransaction })
      }

      if (userActiveBonus.amountToWager <= userActiveBonus.wageredAmount) {
        // user has completed wagering criteria
        userActiveBonus.status = BONUS_STATUS.READY_TO_CLAIM
        userActiveBonus.wageringStatus = WAGERING_STATUS.COMPLETE
        await userActiveBonus.save({ transaction: sequelizeTransaction })
        // userWallet.amount = plus(userWallet.amount, userActiveBonus.bonusAmount)
        // userWallet.bonusBalance = minus(userWallet.bonusBalance, userActiveBonus.bonusAmount)
        // await userWallet.save({ transaction: sequelizeTransaction })
      }

      const userBonus = userActiveBonus.dataValues
      // WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      WageringEmitter.emitWagering(userBonus, userWallet.ownerId)
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

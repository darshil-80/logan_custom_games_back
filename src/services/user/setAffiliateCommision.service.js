import ServiceBase from '../../libs/serviceBase'
import { plus } from 'number-precision'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import { AFFILIATE_STATUS, PAYMENT_METHODS, SETTLEMENT_STATUS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../libs/constants'

/**
 * Provides service for the set affiliate commision
 * @export
 * @class SetAffiliateCommisionService
 * @extends {ServiceBase}
 */
export default class SetAffiliateCommisionService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        Affiliate: AffiliateModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        PaymentTransaction: PaymentTransactionModel,
        AffiliateSettlement: AffiliateSettlementModel,
        AffiliateCommisionSetting: AffiliateCommisionSettingModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction, sequelize
    } = this.context

    const affiliate = await AffiliateModel.findOne({
      where: { ownerId: userId, status: AFFILIATE_STATUS.ACTIVE },
      transaction: sequelizeTransaction
    })

    if (!affiliate) {
      return this.addError('AffiliatesNotExistsErrorType')
    }

    const settleAffiliate = await AffiliateSettlementModel.findAll({
      where: { affiliateId: affiliate.id, status: SETTLEMENT_STATUS.PENDING },
      attributes: [
        [sequelize.fn('sum', sequelize.col('profit_commision_amount')), 'profitCommisionAmount'], 'status'
      ],
      group: ['affiliate_id', 'AffiliateSettlement.status'], // Group by affiliateId if you have multiple records per affiliate
      transaction: sequelizeTransaction,
      raw: true // This makes sure that the output is easier to handle
    })
    if (!settleAffiliate) {
      return this.addError('AffiliatesSettlementNotExistsErrorType')
    }

    const currency = await CurrencyModel.findOne({
      where: { code: 'USD' },
      transaction: sequelizeTransaction
    })

    const userWallet = await WalletModel.findOne({
      where: { ownerId: userId, currencyId: currency.id },
      transaction: sequelizeTransaction
    })

    try {
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      if (settleAffiliate[0].status === SETTLEMENT_STATUS.PENDING) {
        userWallet.amount = plus(userWallet.amount, settleAffiliate[0].profitCommisionAmount)
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      const affiliateTransactionObj = {
        actioneeType: USER_TYPES.USER,
        actioneeId: userId,
        amount: settleAffiliate[0].profitCommisionAmount,
        status: TRANSACTION_STATUS.SUCCESS,
        transactionType: TRANSACTION_TYPES.AFFILIATE,
        targetWalletId: userWallet.id,
        currencyId: userWallet.currencyId,
        paymentMethod: PAYMENT_METHODS.AFFILIATE
      }

      const affiliateTransaction = await PaymentTransactionModel.create(affiliateTransactionObj, { transaction: sequelizeTransaction })

      const commisionSettingsInfo = await AffiliateCommisionSettingModel.findOne({
        where: {
          affiliateId: affiliate.id
        },
        transaction: sequelizeTransaction
      })

      if (!commisionSettingsInfo) {
        return 'Commision settings is not set for affiliates'
      }

      if (settleAffiliate.length > 0) {
        await AffiliateSettlementModel.update(
          { status: SETTLEMENT_STATUS.COMPLETED, transactionId: affiliateTransaction.transactionId }, // Set status to 'completed'
          {
            where: { affiliateId: affiliate.id, status: SETTLEMENT_STATUS.PENDING },
            transaction: sequelizeTransaction
          }

        )
      }

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      return { settleAffiliate }
    } catch (e) {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

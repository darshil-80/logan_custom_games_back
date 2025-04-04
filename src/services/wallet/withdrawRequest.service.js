import { minus } from 'number-precision'
import ServiceBase from '../../libs/serviceBase'
import rateConversion from '../../utils/rateConversion.utils'
import Coinpayments from 'coinpayments'
import config from '../../configs/app.config'
import ajv from '../../libs/ajv'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import {
  WITHDRAW_REQUEST_STATUS,
  TRANSACTION_TYPES,
  USER_TYPES,
  PAYMENT_METHODS,
  // EMAIL_TEMPLATE_CATEGORY,
  AUTO_WITHDRAW_REQUEST_SETTING_STATUS
} from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    withdrawalAmount: { type: 'number', exclusiveMinimum: 0 },
    withdrawalAddress: { type: 'string' },
    walletId: { type: 'number' }
  },
  required: ['withdrawalAmount', 'withdrawalAddress', 'walletId']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to withdraw request for a user
 * @class WithdrawRequestService
 * @extends {ServiceBase}
 */
export default class WithdrawRequestService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      // req: { headers: { language, authorization } },
      dbModels: {
        User: UserModel,
        WithdrawRequest: WithdrawRequestModel,
        PaymentTransaction: PaymentTransactionModel,
        Wallet: WalletModel,
        // CrmTemplate: CrmTemplateModel,
        Currency: CurrencyModel,
        AutoWithdrawRequestSetting: AutoWithdrawRequestSettingModel
      },
      auth: { id: userId, email },
      sequelizeTransaction
    } = this.context

    const walletObj = {
      withdrawalAmount: this.args.withdrawalAmount,
      withdrawalAddress: this.args.withdrawalAddress,
      walletId: this.args.walletId
    }

    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    // If the user email is not verified he can not withdraw the amount.
    if (!user.emailVerified) {
      return this.addError('EmailNotVerifiedErrorType', `email: ${email} is not verified`)
    }

    const targetWallet = await WalletModel.findOne({
      where: { walletAddress: this.args.withdrawalAddress },
      transaction: sequelizeTransaction
    })
    const userWallet = await WalletModel.findByPk(walletObj.walletId, {
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
      include: [
        {
          attributes: ['code', 'id'],
          model: CurrencyModel,
          as: 'currency'
        }
      ],
      transaction: sequelizeTransaction
    })

    const walletForCasino = await WalletModel.findOne({
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
      where: { ownerId: userWallet.ownerId, primary: true }
    })

    if (!userWallet) {
      return this.addError('NoWalletFoundErrorType')
    }
    if (userWallet.type === 'fiat') {
      return this.addError('FiatCurrencyWithdrawalErrorType')
    }

    // conversion will take place
    const amountInMultipleCurrency = await rateConversion(userWallet.currency.code, walletObj.withdrawalAmount)

    // Check if the wallet amount is greater than the withdrawal amount check
    if (amountInMultipleCurrency.amountInUsd > walletForCasino.amount) {
      return this.addError('NotEnoughBalanceErrorType')
    }

    // Check withdrawal request already pending
    const transaction = await PaymentTransactionModel.findOne({
      where: {
        actioneeType: USER_TYPES.USER,
        actioneeId: user.id,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
        sourceWalletId: walletObj.walletId
      },
      transaction: sequelizeTransaction
    })

    if (transaction) {
      return this.addError('WithdrawalRequestAlreadyPendingErrorType')
    }

    // Creating a transaction before deducting amount from the wallet
    const withdrawTransaction = await PaymentTransactionModel.create(
      {
        actioneeType: USER_TYPES.USER,
        actioneeId: user.id,
        amount: amountInMultipleCurrency.amountInUsd,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
        transactionType: TRANSACTION_TYPES.WITHDRAW,
        paymentMethod: PAYMENT_METHODS.COINPAYMENT,
        sourceWalletId: walletObj.walletId,
        targetWalletId: (targetWallet) ? targetWallet.id : null,
        moreDetails: {
          targetCurrencyId: userWallet.currency.id,
          targetCurrencyCode: amountInMultipleCurrency.currency,
          amount: walletObj.withdrawalAmount,
          amountBTC: amountInMultipleCurrency.amountInBtc,
          amountUSD: amountInMultipleCurrency.amountInUsd
        }
      },
      {
        transaction: sequelizeTransaction
      }
    )

    const requestDetail = await WithdrawRequestModel.create(
      {
        userId: user.id,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
        // walletAddress: walletObj.withdrawalAddress,
        amount: walletObj.withdrawalAmount,
        transactionId: withdrawTransaction.transactionId,
        walletId: walletObj.walletId,
        withdrawalAddress: walletObj.withdrawalAddress
      },
      {
        transaction: sequelizeTransaction
      }
    )

    // Updating wallet - deducting the amount from the wallet
    await walletForCasino.update({
      amount: minus(walletForCasino.amount, amountInMultipleCurrency.amountInUsd)
    }, {
      transaction: sequelizeTransaction
    })
    WalletEmitter.emitUserWalletBalance(walletForCasino?.toJSON(), walletForCasino.ownerId)

    // verify user email
    // const crmTemplate = await CrmTemplateModel.findOne({
    //   where: {
    //     category: EMAIL_TEMPLATE_CATEGORY.WITHDRAW_REQUEST_INITIATED
    //   },
    //   transaction: sequelizeTransaction
    // })

    // if (!crmTemplate) {
    //   this.addError('SomethingWentWrongErrorType', 'Email template not found.')
    //   return
    // }

    // const emailData = {
    //   email: user.email,
    //   name: user.userName || 'User',
    //   amount: walletObj.withdrawalAmount,
    //   currencyCode: userWallet.currency.code
    // }

    // await axios.post(`${config.get('game_engine_url')}/api/v1/mail/send-mail`, {
    //   email: user.email,
    //   crmId: crmTemplate.id,
    //   emailDynamicData: emailData
    // })

    const autoWithdrawRequestSettingDetails = await AutoWithdrawRequestSettingModel.findOne({
      where: { status: AUTO_WITHDRAW_REQUEST_SETTING_STATUS.TRUE },
      transaction: sequelizeTransaction
    })
    if (walletObj.withdrawalAmount > autoWithdrawRequestSettingDetails.minWithdrawAmount[userWallet.currency.code] && walletObj.withdrawalAmount < autoWithdrawRequestSettingDetails.maxWithdrawAmount[userWallet.currency.code]) {
      const ipnUrl = `${config.get('user_backend_app_url')}/api/v1/coin-payment/withdraw-callback`

      const options = {
        key: config.get('coin_payments.public_key'),
        secret: config.get('coin_payments.secret')
      }

      const client = new Coinpayments(options)

      const callbackConfigOptions = {
        amount: walletObj.withdrawalAmount,
        currency: userWallet.currency.code,
        ipn_url: ipnUrl,
        auto_confirm: 1,
        address: walletObj.withdrawalAddress
      }

      const { id: coinPaymentTxnId } = await client.createWithdrawal(callbackConfigOptions)

      await WithdrawRequestModel.update(
        {
          status: WITHDRAW_REQUEST_STATUS.AUTO_APPROVED
        },
        {
          where: { transactionId: requestDetail.transactionId },
          transaction: sequelizeTransaction
        }
      )

      await PaymentTransactionModel.update(
        { coinPaymentTxnId, status: WITHDRAW_REQUEST_STATUS.AUTO_APPROVED },
        {
          where: { transactionId: requestDetail.transactionId },
          transaction: sequelizeTransaction
        }
      )
      return requestDetail
    }
  }
}

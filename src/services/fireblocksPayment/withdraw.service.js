import { minus } from 'number-precision'
import ajv from '../../libs/ajv'
import { FIREBLOCKS_ACCOUNT_TYPE, PAYMENT_METHODS, TRANSACTION_TYPES, USER_TYPES, WITHDRAW_REQUEST_STATUS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import { fireBlocks } from '../../libs/fireBlock'
import rateConversion from '../../utils/rateConversion.utils'
import config from '../../configs/app.config'

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

// Define the currency mapper
const currencyMapper = {
  LTC_TEST: 'LTC',
  BTC_TEST: 'BTC',
  SOL_TEST: 'ETH'
}

/**
 * Provides service to withdraw request for a user
 * @class WithdrawService
 * @extends {ServiceBase}
 */
export default class WithdrawService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        PaymentTransaction: PaymentTransactionModel,
        Wallet: WalletModel,
        Currency: CurrencyModel
      },
      auth: { id: userId, email },
      sequelizeTransaction
    } = this.context

    console.log(sequelizeTransaction?.options)
    const walletObj = {
      withdrawalAmount: this.args.withdrawalAmount,
      withdrawalAddress: this.args.withdrawalAddress,
      walletId: this.args.walletId
    }

    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    if (!user.emailVerified) {
      return this.addError('EmailNotVerifiedErrorType', `email: ${email} is not verified`)
    }

    const userWallet = await WalletModel.findByPk(walletObj.walletId, {
      include: [
        {
          attributes: ['code', 'id'],
          model: CurrencyModel,
          as: 'currency'
        }
      ],
      transaction: sequelizeTransaction
    })

    const primaryWalletId = await WalletModel.findOne({
      where: { ownerId: userWallet.ownerId, primary: true }
    })

    if (!userWallet) {
      return this.addError('NoWalletFoundErrorType')
    }
    if (userWallet.type === 'fiat') {
      return this.addError('FiatCurrencyWithdrawalErrorType')
    }

    // Map the currency code if necessary
    const mapcurrencyCode = currencyMapper[userWallet.currency.code] || userWallet.currency.code
    const amountInMultipleCurrency = await rateConversion(mapcurrencyCode, walletObj.withdrawalAmount)

    if (amountInMultipleCurrency.amountInUsd > primaryWalletId.amount) {
      return this.addError('NotEnoughBalanceErrorType')
    }

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

    const withdrawTransaction = await PaymentTransactionModel.create(
      {
        actioneeType: USER_TYPES.USER,
        actioneeId: user.id,
        amount: amountInMultipleCurrency.amountInUsd,
        status: WITHDRAW_REQUEST_STATUS.PENDING,
        transactionType: TRANSACTION_TYPES.WITHDRAW,
        paymentMethod: PAYMENT_METHODS.FIREBLOCKS,
        sourceWalletId: walletObj.walletId,
        targetWalletId: null,
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

    let withdrawRequest = {}
    try {
      withdrawRequest = await fireBlocks.createTransaction({
        assetId: userWallet.currency.code,
        source: {
          type: FIREBLOCKS_ACCOUNT_TYPE.VAULT_ACCOUNT,
          id: config.get('fireblocks.funding_account_id')
        },
        destination: {
          type: FIREBLOCKS_ACCOUNT_TYPE.ONE_TIME_ADDRESS,
          oneTimeAddress: {
            address: walletObj.withdrawalAddress
          }
        },
        amount: walletObj.withdrawalAmount.toString(), // Convert to string explicitly
        feeLevel: 'MEDIUM',
        operation: 'TRANSFER'
      })
    } catch (error) {
      return this.addError('WithdrawalFailedInFireblocks')
    }

    await primaryWalletId.update({
      amount: minus(primaryWalletId.amount, amountInMultipleCurrency.amountInUsd)
    }, {
      transaction: sequelizeTransaction
    })
    WalletEmitter.emitUserWalletBalance(primaryWalletId?.toJSON(), primaryWalletId.ownerId)

    await PaymentTransactionModel.update(
      { coinPaymentTxnId: withdrawRequest.id, status: WITHDRAW_REQUEST_STATUS.PENDING },
      { where: { id: withdrawTransaction.id }, transaction: sequelizeTransaction }
    )
    return withdrawTransaction
  }
}

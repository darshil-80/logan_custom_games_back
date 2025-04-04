import { plus } from 'number-precision'
import ajv from '../../libs/ajv'
import { FIREBLOCKS_ACCOUNT_TYPE, PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../libs/constants'
import { fireBlocks } from '../../libs/fireBlock'
import ServiceBase from '../../libs/serviceBase'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import config from '../../configs/app.config'
import DistributeDepositBonusService from '../bonus/distributeDepositBonus.service'

const schema = {
  type: 'object',
  properties: {
    txn_id: { type: 'string' },
    amount: { type: 'string' },
    amountUSD: { type: 'string' },
    currency: { type: 'string' },
    address: { type: 'string' },
    status: { type: 'string' }
  },
  required: ['txn_id', 'address', 'status', 'currency', 'amount', 'amountUSD']
}

const constraints = ajv.compile(schema)

/**
 * Provides the service to accept the deposit callback from coin payment
 * @export
 * @class DepositCallback
 * @extends {ServiceBase}
 */
export default class DepositCallback extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      txn_id: txnId,
      amount: depositedAmount,
      address: callbackAddress,
      status: callbackStatus,
      amountUSD,
      currency
    } = this.args

    const {
      dbModels: {
        Wallet: WalletModel,
        PaymentTransaction: PaymentTransactionModel,
        User: UserModel
      },
      sequelizeTransaction
    } = this.context

    if (txnId && (callbackStatus === TRANSACTION_STATUS.SUCCESS)) {
      const wallet = await WalletModel.findOne({
        where: { walletAddress: callbackAddress, ownerType: USER_TYPES.USER },
        include: [
          {
            model: UserModel,
            as: 'user'
          }
        ],
        transaction: sequelizeTransaction
      })

      if (!wallet) {
        return { status: 404, message: 'The  wallet address is not present in our database' }
      }

      const { id: walletId, ownerId: userId, currencyId } = wallet
      const primaryWallet = await WalletModel.findOne({
        where: { ownerId: userId, primary: true }
      })

      const transactionObj = {
        coinPaymentTxnId: txnId,
        actioneeType: USER_TYPES.USER,
        actioneeId: userId,
        amount: depositedAmount,
        status: TRANSACTION_STATUS.SUCCESS,
        transactionType: TRANSACTION_TYPES.DEPOSIT,
        targetWalletId: walletId,
        targetCurrencyId: currencyId,
        paymentMethod: PAYMENT_METHODS.FIREBLOCKS,
        moreDetails: {
          targetCurrencyId: currencyId,
          targetCurrencyCode: currency,
          amount: parseFloat(depositedAmount),
          amountBTC: depositedAmount,
          amountUSD: amountUSD
        }
      }

      await PaymentTransactionModel.create(transactionObj, { transaction: sequelizeTransaction })

      await primaryWallet.update({ amount: plus(primaryWallet.amount, amountUSD) }, {
        transaction: sequelizeTransaction
      })

      // Transfer balance from this vault to the funding vault
      const createVaultTransfer = {
        assetId: currency,
        amount: depositedAmount,
        source: {
          type: FIREBLOCKS_ACCOUNT_TYPE.VAULT_ACCOUNT,
          id: wallet.user.vaultId
        },
        destination: {
          type: FIREBLOCKS_ACCOUNT_TYPE.VAULT_ACCOUNT,
          id: config.get('fireblocks.funding_account_id')
        }
      }

      await fireBlocks.createTransaction(createVaultTransfer)

      WalletEmitter.emitUserWalletBalance(primaryWallet?.toJSON(), primaryWallet.ownerId)

      // Distribute deposit bonus
      await DistributeDepositBonusService.execute({ callbackAmount: depositedAmount, wallet: primaryWallet }, this.context)
    }

    return { message: 'Transaction completed successfully', status: 200 }
  }
}

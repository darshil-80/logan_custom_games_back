import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { minus } from 'number-precision'
import { PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES, WITHDRAW_REQUEST_STATUS } from '../../libs/constants'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'

const schema = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    accountType: { type: 'string' },
    accountNumber: { type: 'string' },
    customerCertification: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)
/**
 * This service is use to withdraw amount
 * @class GogopayCreateWithdrawService
 * @extends {ServiceBase}
 */
export default class GogopayCreateWithdrawService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { amount, accountType, accountNumber, customerCertification } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        PaymentTransaction: PaymentTransactionModel,
        WithdrawRequest: WithdrawRequestModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    try {
      const userDetail = await UserModel.findOne({
        where: {
          id: userId
        },
        include:
          [{
            model: WalletModel,
            required: false,
            as: 'wallets',
            include: [
              {
                model: CurrencyModel,
                required: false,
                as: 'currency'
              }
            ]
          }],
        transaction: sequelizeTransaction
      })

      const userWallet = await WalletModel.findOne({
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
        where: { ownerId: userDetail.id },
        transaction: sequelizeTransaction
      })

      const userCurrency = userDetail.wallets[0]?.currency.code

      if (!userDetail) return this.addError('UserNotExistsErrorType')

      // Check withdrawal request already pending
      const transaction = await PaymentTransactionModel.findOne({
        where: {
          actioneeType: USER_TYPES.USER,
          actioneeId: userDetail.id,
          status: TRANSACTION_STATUS.PENDING,
          sourceWalletId: userWallet.id
        },
        transaction: sequelizeTransaction
      })

      if (transaction) {
        return this.addError('TransactionAlreadyPendingErrorType')
      }

      // Check if the wallet amount is greater than the withdrawal amount
      if (amount > userWallet.amount) {
        return this.addError('NotEnoughBalanceErrorType')
      }

      const transactionObj = {
        actioneeType: USER_TYPES.USER,
        actioneeId: userId,
        actioneeName: userDetail.userName,
        actioneeEmail: userDetail.email,
        actioneeIp: userDetail.signInIp,
        orderAmount: parseFloat(amount),
        transactionDateTime: Date.now(),
        status: TRANSACTION_STATUS.PENDING,
        transactionType: TRANSACTION_TYPES.WITHDRAW,
        currencyId: userWallet.currencyId,
        orderCurrency: userCurrency,
        sourceWalletId: userWallet.id,
        paymentMethod: PAYMENT_METHODS.GOGOPAY,
        accountType: accountType,
        accountNum: accountNumber,
        customerCertification
      }

      const newTransaction = await PaymentTransactionModel.create(transactionObj, { transaction: sequelizeTransaction })

      try {
        await userWallet.update(
          {
            amount: minus(userWallet.amount, amount)
          },
          {
            where: { id: userWallet.id },
            returning: true,
            transaction: sequelizeTransaction
          }
        )

        const requestDetail = await WithdrawRequestModel.create(
          {
            userId,
            status: WITHDRAW_REQUEST_STATUS.PENDING,
            amount,
            transactionId: newTransaction.transactionId,
            walletId: userWallet.id,
            accountNumber: accountNumber,
            accountType: accountType,
            name: userDetail.userName
          },
          {
            transaction: sequelizeTransaction
          }
        )

        await sequelizeTransaction.commit()

        WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
        return requestDetail
      } catch (err) {
        if (!sequelizeTransaction.finished) {
          await sequelizeTransaction.rollback()
        }
        return this.addError('InternalServerErrorType')
      }
    } catch (error) {
      return this.addError('InternalServerErrorType', error)
    }
  }
}

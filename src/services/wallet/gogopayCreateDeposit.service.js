import axios from 'axios'
import config from '../../configs/app.config'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { PAYMENT_METHODS, TRANSACTION_STATUS, TRANSACTION_TYPES, USER_TYPES } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    amount: { type: 'number' }
  }
}

const constraints = ajv.compile(schema)
/**
 * This service is use to deposit amount
 * @class GogopayCreateDepositService
 * @extends {ServiceBase}
 */
export default class GogopayCreateDepositService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { amount } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        PaymentTransaction: PaymentTransactionModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    try {
      const GOGOPAY_URL = config.get('gogopay.url')
      const GOGOPAY_APP_ID = config.get('gogopay.app_id')
      const GOGOPAY_SECRET_KEY = config.get('gogopay.secret_key')

      // Convert to base64 for authorization at gogopay end
      const authorization = btoa(`${GOGOPAY_APP_ID}:${GOGOPAY_SECRET_KEY}`)

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

      const userWallet = userDetail.wallets?.length ? userDetail.wallets[0] : null

      if (!userDetail) return this.addError('UserNotExistsErrorType')

      const transactionObj = {
        actioneeType: USER_TYPES.USER,
        actioneeId: userId,
        actioneeName: userDetail.userName,
        actioneeEmail: userDetail.email,
        actioneeIp: userDetail.signInIp,
        orderAmount: parseFloat(amount),
        transactionDateTime: Date.now(),
        status: TRANSACTION_STATUS.PENDING,
        paymentMethod: PAYMENT_METHODS.GOGOPAY,
        transactionType: TRANSACTION_TYPES.DEPOSIT,
        currencyId: userWallet.currency.id,
        orderCurrency: userWallet?.currency?.code,
        targetWalletId: userWallet.id
      }

      const gogoPayTransaction = await PaymentTransactionModel.create(transactionObj, { transaction: sequelizeTransaction })

      const payload = {
        money: amount,
        order_number: gogoPayTransaction.transactionId, // Our System transactionId
        notify_url: `${config.get('user_backend_app_url')}/api/v1/gogopay/deposit-callback`,
        customer_email: userDetail.email,
        customer_phone: userDetail.phone,
        customer_name: userDetail.userName,
        customer_cert: null // Need to ask from client customer certification is what ?
      }

      try {
        const paymentDeposit = await axios.post(`${GOGOPAY_URL}/v1/collection/create`, payload, {
          headers: {
            'Content-Type': 'application/json',
            token: authorization
          }
        })

        const response = paymentDeposit.data

        await gogoPayTransaction.set({
          gogoSystemOrderNumber: response.system_order_number,
          gogoOrderStatus: response.status,
          gogoPayType: response.pay_type
        }).save({ transaction: sequelizeTransaction })

        return response
      } catch (err) {
        return this.addError('ExternalApiErrorType')
      }
    } catch (error) {
      this.addError('InternalServerErrorType', error)
    }
  }
}

import axios from 'axios'
import config from '../../configs/app.config'
import ServiceBase from '../../libs/serviceBase'

/**
 * This service is use to gogopay withdraw amount Status
 * @class GetGogopayWithdrawStatusService
 * @extends {ServiceBase}
 */

export default class GetGogopayWithdrawStatusService extends ServiceBase {
  async run () {
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

      if (!userDetail) return this.addError('UserNotExistsErrorType')

      const gogoPayTransaction = await PaymentTransactionModel.findOne({
        where: { actioneeId: userDetail.id },
        transaction: sequelizeTransaction
      })

      try {
        const withdrawStatus = await axios.get(`${GOGOPAY_URL}/v1/payment/query`, {
          headers: {
            token: authorization
          },
          params: { order_number: gogoPayTransaction.transactionId }
        })

        const response = withdrawStatus.data

        await gogoPayTransaction.set({
          gogoSystemOrderNumber: response.system_order_number,
          gogoOrderStatus: response.status
        }).save({ transaction: sequelizeTransaction })

        return withdrawStatus.data
      } catch {
        return this.addError('ExternalApiErrorType')
      }
    } catch (error) {
      this.addError('InternalServerErrorType', error)
    }
  }
}

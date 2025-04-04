import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { EAR_ERROR_CODES } from '../../libs/earErrorCodes'
import config from '../../configs/app.config'
// import { CURRENCY_FOR_CASINO } from '../../libs/constants'

const schema = {
  // type: 'object',
  // properties: {
  //   user_id: { type: 'number' }
  // }
}

const constraints = ajv.compile(schema)
/**
 * Callback for user info for ear casino
 * @export
 * @class GetUserInfoCallbackService
 * @extends {ServiceBase}
 */

export default class GetUserInfoCallbackService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { user_id: userId } = this.args
    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel
      },
      sequelizeTransaction
    } = this.context

    const user = await UserModel.findOne({
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
    // const userWallet = user.wallets?.length ? user.wallets.filter(item => item.currencyId === CURRENCY_FOR_CASINO)[0] : null
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null

    const responseObject = {}
    if (!userWallet) {
      responseObject.statusCode = EAR_ERROR_CODES.UNKNOWN_ERROR
      responseObject.status = false
      responseObject.errors = {
        code: EAR_ERROR_CODES.UNKNOWN_ERROR,
        error: 'user wallet not found'
      }
      return responseObject
    }

    if (!user.active) {
      responseObject.statusCode = EAR_ERROR_CODES.USER_BLOCKED
      responseObject.status = false
      responseObject.errors = {
        code: EAR_ERROR_CODES.UNKNOWN_ERROR,
        error: `user not active with userId ${userId}`
      }
      return responseObject
    }

    const responseData = {
      id: userId,
      first_name: user.firstName,
      surname: user.lastName,
      username: user.userName,
      current_status: 0,
      user_type: '1',
      skin_id: config.get('ear_casino.client_id'),
      balance: +userWallet.amount.toFixed(2),
      balance_bonus: +userWallet.nonCashAmount.toFixed(2),
      short_name: userWallet.currency.code
    }

    return responseData
  }
}

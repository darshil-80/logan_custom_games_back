import { generateNonce } from '../../helpers/user.helpers'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    ethereumAddress: {
      type: 'string'
    }
  },
  required: ['ethereumAddress']
}

const constraints = ajv.compile(schema)

/**
 * It checks if the user exists in the database, if it does, it returns a nonce, if it doesn't, it returns a common nonce
 * @export
 * @class CheckUserAddressService
 * @extends {ServiceBase}
 */
export default class CheckUserAddressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel, Currency, Wallet: WalletModel },
      sequelizeTransaction
    } = this.context

    const ethereumAddress = String(this.args.ethereumAddress).toLowerCase()

    const user = await UserModel.findOne({
      where: {
        ethereumAddress
      },
      transaction: sequelizeTransaction
    })

    const nonce = generateNonce()

    if (!user) {
      const currencies = await Currency.findAll({
        transaction: sequelizeTransaction
      })

      const wallets = currencies.map((currency) => {
        return {
          amount: '0',
          currencyId: currency.id,
          primary: currency.primary

        }
      })

      await UserModel.create({
        ethereumAddress,
        wallets,
        nonce
      }, {
        include: {
          model: WalletModel,
          as: 'wallets'
        },
        transaction: sequelizeTransaction
      })
    } else {
      user.nonce = nonce
      await user.save({ transaction: sequelizeTransaction })
    }

    return { nonce }
  }
}

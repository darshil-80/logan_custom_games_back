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
export default class CheckAuthenticatedUserAddressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const ethereumAddress = String(this.args.ethereumAddress).toLowerCase()

    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    const ethereumAddressUser = await UserModel.findOne({
      where: {
        ethereumAddress
      },
      transaction: sequelizeTransaction
    })

    if (user.id !== ethereumAddressUser.id) {
      return this.addError(
        'UserAlreadyExistsErrorType',
        `ethereumAddress: ${ethereumAddress} already registered`
      )
    }

    const nonce = generateNonce()

    if (!user.ethereumAddress) {
      user.ethereumAddress = ethereumAddress
    }

    user.nonce = nonce

    await user.save({ transaction: sequelizeTransaction })

    return { nonce: user.nonce }
  }
}

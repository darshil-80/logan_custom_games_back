import ajv from '../../libs/ajv'
import { LOGIN_METHODS } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import web3 from '../../libs/web3'

const schema = {
  type: 'object',
  properties: {
    ethereumAddress: { type: 'string' },
    signedMessage: { type: 'string' }
  },
  required: ['ethereumAddress', 'signedMessage']
}

const constraints = ajv.compile(schema)

/**
 * it provides service of login with meta mask for a user
 * @export
 * @class LoginWithMetaMaskService
 * @extends {ServiceBase}
 */
export default class LoginAuthenticatedUserWithMetaMaskService extends ServiceBase {
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
    const signedMessage = this.args.signedMessage

    if (!web3.utils.isAddress(ethereumAddress)) {
      return this.addError(
        'InvalidBlockchainAddressErrorType',
        `ethereumAddress: ${ethereumAddress}`
      )
    }

    const whereCondition = {
      id: userId,
      ethereumAddress
    }

    const user = await UserModel.findOne({
      where: whereCondition,
      attributes: { exclude: ['encryptedPassword'] },
      transaction: sequelizeTransaction
    })

    if (user && !user.active) {
      return this.addError(
        'AccountNotActiveErrorType',
        `User account status: ${user.active}`
      )
    }

    const recoveredBlockchainAddress = String(await web3.eth.accounts.recover(user?.nonce, signedMessage)).toLowerCase()

    if (recoveredBlockchainAddress !== ethereumAddress) {
      return this.addError(
        'AddressMismatchErrorType',
        `Given Address: ${ethereumAddress}`
      )
    }

    try {
      // after successful login empty nonce
      user.nonce = null

      user.signInCount += 1

      user.loginMethod = LOGIN_METHODS.METAMASK

      user.signInIp =
        (this.context.req.headers['x-forwarded-for'] || '').split(',')[0] ||
        this.context.req.connection.remoteAddress

      user.lastLogin = Date.now()

      await user.save({ transaction: sequelizeTransaction })
      return user.toJSON()
    } catch {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

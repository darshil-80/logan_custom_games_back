import speakeasy from 'speakeasy'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    userToken: { type: 'number' }
  },
  required: ['userToken']
}

const constraints = ajv.compile(schema)

/**
 * it provides service of Authenticate the token for the first time when user user enable 2 factor authentication for the first time
 * @export
 * @class authenticateTokenFirstTimeService
 * @extends {ServiceBase}
 */
export default class AuthenticateTokenFirstTimeService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    if (user) {
      const base32secret = user.twoFactorSecretKey

      const verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: 'base32',
        token: this.args.userToken
      })

      if (verified) {
        user.twoFactorEnabled = true
        await user.save()

        return { message: 'User Verified', user: user.toJSON() }
      } else {
        return this.addError('InvalidVerificationTokenErrorType', 'Wrong Input')
      }
    } else {
      return this.addError('UserNotExistsErrorType', 'User Not Found')
    }
  }
}

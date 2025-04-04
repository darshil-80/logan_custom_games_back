import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'

const schema = {
  type: 'object',
  properties: {
    otp: {
      type: 'string'
    }
  },
  required: ['otp']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to verify phone no. of the user
 * @export
 * @class VerifyPhoneNumberService
 * @extends {ServiceBase}
 */
export default class VerifyPhoneNumberService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel, UserToken: UserTokenModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const otp = this.args.otp

    const verifyPhoneToken = await UserTokenModel.findOne({
      where: { userId, token: otp, tokenType: 'phone' },
      transaction: sequelizeTransaction
    })

    if (!verifyPhoneToken) {
      return this.addError(
        'InvalidTokenErrorType',
        'Token is Expired or not valid'
      )
    }

    await UserModel.update(
      {
        phoneVerified: true
      },
      {
        where: {
          id: userId
        },
        transaction: sequelizeTransaction
      }
    )

    await verifyPhoneToken.destroy()

    return { message: 'User Phone Verified' }
  }
}

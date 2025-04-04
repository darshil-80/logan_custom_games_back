// import { Op } from 'sequelize'
import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import { getCachedData } from '../../helpers/redis.helpers'

const schema = {
  type: 'object',
  properties: {
    OTP: {
      type: 'string'
    }
  },
  required: ['OTP']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to verify email token
 * @export
 * @class VerifyEmailOtpService
 * @extends {ServiceBase}
 */
export default class VerifyEmailOtpService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    let userData = await getCachedData(userId)

    if (!userData) {
      return this.addError('OtpNotInCacheErrorType')
    }

    userData = JSON.parse(userData)
    if (userData.OTP !== this.args.OTP) {
      return this.addError('OtpIncorrectErrorType')
    }

    await UserModel.update(
      {
        emailVerified: true,
        email: userData.email
      },
      {
        where: { id: userId },
        transaction: sequelizeTransaction
      }
    )

    return { message: 'User email verified', email: userData.email }
  }
}

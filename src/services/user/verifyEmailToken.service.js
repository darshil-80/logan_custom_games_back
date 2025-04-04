import { Op } from 'sequelize'
import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'

const schema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer'
    },
    token: {
      type: 'string'
    }
  },
  required: ['id', 'token']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to verify email token
 * @export
 * @class VerifyEmailTokenService
 * @extends {ServiceBase}
 */
export default class VerifyEmailTokenService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel, UserToken: UserTokenModel },
      sequelizeTransaction
    } = this.context

    const userObj = {
      token: this.args.token,
      id: this.args.id
    }

    const currentDate = new Date()
    const expirationDate = new Date(
      currentDate.setHours(currentDate.getHours() - 3)
    )
    const validToken = await UserTokenModel.findOne({
      where: {
        [Op.and]: [
          { userId: userObj.id },
          { tokenType: 'email' },
          { token: userObj.token },
          { updatedAt: { [Op.gt]: expirationDate } }
        ]
      },
      transaction: sequelizeTransaction
    })

    if (!validToken) {
      return this.addError('InvalidVerificationTokenErrorType', 'Token is not valid')
    }

    const user = await UserModel.findOne({
      where: { id: userObj.id },
      transaction: sequelizeTransaction
    })

    await UserTokenModel.destroy({
      where: {
        [Op.and]: [{ userId: userObj.id }, { token: userObj.token }, { tokenType: 'email' }]
      },
      transaction: sequelizeTransaction
    })

    if (!user) {
      return this.addError('UserNotExistsErrorType', 'User not found')
    }

    await user.update(
      {
        emailVerified: true
      },
      {
        individualHooks: true,
        transaction: sequelizeTransaction
      }
    )

    return { message: 'user email verified', email: user.email }
  }
}

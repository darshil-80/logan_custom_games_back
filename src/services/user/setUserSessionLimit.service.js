import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import bcrypt from 'bcrypt'

const schema = {
  type: 'object',
  properties: {
    timeLimit: { type: 'number' },
    password: { type: 'string' }
  },
  required: ['password', 'timeLimit']
}
const constraints = ajv.compile(schema)

/**
 * Provides service to user to set session limit
 * @export
 * @class PrimaryWalletService
 * @extends {ServiceBase}
 */
export default class SetUserSessionLimitService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        UserLimit: UserLimitModel,
        User: UserModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const { timeLimit, password } = this.args

    if (timeLimit > 24 || timeLimit < 1) return this.addError('SessionTimeLimitErrorType')

    const currentUser = await UserModel.findOne({
      where: { id: userId },
      attributes: ['encryptedPassword'],
      raw: true,
      transaction: sequelizeTransaction
    })

    const passwordMatch = await bcrypt.compare(
      password,
      currentUser.encryptedPassword
    )

    if (!passwordMatch) {
      return this.addError('InvalidCredentialsErrorType')
    }

    const checkLimitExist = await UserLimitModel.findOne({
      where: { userId },
      attributes: ['timeLimitExpiry'],
      raw: true,
      transaction: sequelizeTransaction
    })

    let createdLimit, message

    const timeLimitExpiry = new Date()
    timeLimitExpiry.setDate(timeLimitExpiry.getDate() + 1)

    if (checkLimitExist) {
      createdLimit = await UserLimitModel.update({ timeLimit, timeLimitExpiry, timeLimitUpdatedAt: new Date() }, { where: { userId }, transaction: sequelizeTransaction })
      message = 'Limit updated successfully'
    } else {
      createdLimit = await UserLimitModel.create({ userId, timeLimit, timeLimitExpiry, timeLimitUpdatedAt: new Date() }, { transaction: sequelizeTransaction })
      message = 'Limit created successfully'
    }

    return { message, createdLimit }
  }
}

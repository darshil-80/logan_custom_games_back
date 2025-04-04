import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import bcrypt from 'bcrypt'

const schema = {
  type: 'object',
  properties: {
    daily: { type: 'number' },
    weekly: { type: 'number' },
    monthly: { type: 'number' },
    password: { type: 'string' }
  },
  required: ['password']
}
const constraints = ajv.compile(schema)

/**
 * Provides service to user to set loss limit
 * @export
 * @class PrimaryWalletService
 * @extends {ServiceBase}
 */
export default class SetUserWagerLimitService extends ServiceBase {
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

    const { daily, weekly, monthly, password } = this.args
    const createLimit = { userId }

    const limitExpiry = new Date()
    limitExpiry.setDate(limitExpiry.getDate() + 1)

    if (daily) {
      createLimit.dailyLossLimit = daily
      createLimit.dailyLossExpiry = limitExpiry
      createLimit.dailyLossUpdatedAt = new Date()
    } else {
      createLimit.dailyLossLimit = null
      createLimit.dailyLossExpiry = null
      createLimit.dailyLossUpdatedAt = new Date()
    }
    if (weekly) {
      createLimit.weeklyLossLimit = weekly
      createLimit.weeklyLossExpiry = limitExpiry
      createLimit.weeklyLossUpdatedAt = new Date()
    } else {
      createLimit.weeklyLossLimit = null
      createLimit.weeklyLossExpiry = null
      createLimit.weeklyLossUpdatedAt = new Date()
    }
    if (monthly) {
      createLimit.monthlyLossLimit = monthly
      createLimit.monthlyLossExpiry = limitExpiry
      createLimit.monthlyLossUpdatedAt = new Date()
    } else {
      createLimit.monthlyLossLimit = null
      createLimit.monthlyLossExpiry = null
      createLimit.monthlyLossUpdatedAt = new Date()
    }

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
      attributes: ['dailyLossExpiry', 'weeklyLossLimit', 'monthlyLossLimit'],
      raw: true,
      transaction: sequelizeTransaction
    })

    let createdLimit, message

    if (checkLimitExist) {
      createdLimit = await UserLimitModel.update(createLimit, { where: { userId }, transaction: sequelizeTransaction })
      message = 'Limit updated successfully'
    } else {
      createdLimit = await UserLimitModel.create(createLimit, { transaction: sequelizeTransaction })
      message = 'Limit created successfully'
    }

    return { message, createdLimit }
  }
}

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
 * Provides service to user to set bet limit
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
      createLimit.dailyDepositLimit = daily
      createLimit.dailyDepositExpiry = limitExpiry
      createLimit.dailyDepositUpdatedAt = new Date()
    } else {
      createLimit.dailyDepositLimit = null
      createLimit.dailyDepositExpiry = null
      createLimit.dailyDepositUpdatedAt = new Date()
    }
    if (weekly) {
      createLimit.weeklyDepositLimit = weekly
      createLimit.weeklyDepositExpiry = limitExpiry
      createLimit.weeklyDepositUpdatedAt = new Date()
    } else {
      createLimit.weeklyDepositLimit = null
      createLimit.weeklyDepositExpiry = null
      createLimit.weeklyDepositUpdatedAt = new Date()
    }
    if (monthly) {
      createLimit.monthlyDepositLimit = monthly
      createLimit.monthlyDepositExpiry = limitExpiry
      createLimit.monthlyDepositUpdatedAt = new Date()
    } else {
      createLimit.monthlyDepositLimit = null
      createLimit.monthlyDepositExpiry = null
      createLimit.monthlyDepositUpdatedAt = new Date()
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
      attributes: ['dailyDepositExpiry', 'weeklyDepositLimit', 'monthlyDepositLimit'],
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

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
 * Provides service to user to set wager limit
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
    console.log('weekly==============>>>>>>>>>>>>>>>>>>>', monthly)
    const limitExpiry = new Date()
    limitExpiry.setDate(limitExpiry.getDate() + 1)

    if (daily) {
      createLimit.dailyBetLimit = daily
      createLimit.dailyBetExpiry = limitExpiry
      createLimit.dailyBetUpdatedAt = new Date()
    } else {
      createLimit.dailyBetLimit = null
      createLimit.dailyBetExpiry = null
      createLimit.dailyBetUpdatedAt = new Date()
    }
    if (weekly) {
      createLimit.weeklyBetLimit = weekly
      createLimit.weeklyBetExpiry = limitExpiry
      createLimit.weeklyBetUpdatedAt = new Date()
    } else {
      createLimit.weeklyBetLimit = null
      createLimit.weeklyBetExpiry = null
      createLimit.weeklyBetUpdatedAt = new Date()
    }
    if (monthly) {
      createLimit.monthlyBetLimit = monthly
      createLimit.monthlyBetExpiry = limitExpiry
      createLimit.monthlyBetUpdatedAt = new Date()
    } else {
      createLimit.monthlyBetLimit = null
      createLimit.monthlyBetExpiry = null
      createLimit.monthlyBetUpdatedAt = new Date()
    }

    const currentUser = await UserModel.findOne({
      where: { id: userId },
      attributes: ['encryptedPassword'],
      raw: true
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
      attributes: ['dailyBetExpiry', 'weeklyBetLimit', 'monthlyBetLimit'],
      raw: true
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

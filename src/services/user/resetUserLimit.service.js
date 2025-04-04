import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import bcrypt from 'bcrypt'
import { LIMIT_OPTION } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    limitOption: { type: 'string' },
    daily: { type: 'number' },
    weekly: { type: 'number' },
    monthly: { type: 'number' },
    password: { type: 'string' }
  },
  required: ['limitOption', 'password']
}
const constraints = ajv.compile(schema)

export default class ResetUserLimitService extends ServiceBase {
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

    const { limitOption, daily, weekly, monthly, password } = this.args

    let updateData = {}

    if (limitOption === LIMIT_OPTION.DEPOSIT) {
      if (daily) updateData = { ...updateData, dailyDepositLimit: null, dailyDepositExpiry: null, dailyDepositUpdatedAt: new Date() }
      if (weekly) updateData = { ...updateData, weeklyDepositLimit: null, weeklyDepositExpiry: null, weeklyDepositUpdatedAt: new Date() }
      if (monthly) updateData = { ...updateData, monthlyDepositLimit: null, monthlyDepositExpiry: null, monthlyDepositUpdatedAt: new Date() }
    } else if (limitOption === LIMIT_OPTION.LOSS) {
      if (daily) updateData = { ...updateData, dailyLossLimit: null, dailyLossExpiry: null, dailyLossUpdatedAt: new Date() }
      if (weekly) updateData = { ...updateData, weeklyLossLimit: null, weeklyLossExpiry: null, weeklyLossUpdatedAt: new Date() }
      if (monthly) updateData = { ...updateData, monthlyLossLimit: null, monthlyLossExpiry: null, monthlyLossUpdatedAt: new Date() }
    } else if (limitOption === LIMIT_OPTION.WAGER) {
      if (daily) updateData = { ...updateData, dailyBetLimit: null, dailyBetExpiry: null, dailyBetUpdatedAt: new Date() }
      if (weekly) updateData = { ...updateData, weeklyBetLimit: null, weeklyBetExpiry: null, weeklyBetUpdatedAt: new Date() }
      if (monthly) updateData = { ...updateData, monthlyBetLimit: null, monthlyBetExpiry: null, monthlyBetUpdatedAt: new Date() }
    } else {
      updateData = { ...updateData, timeLimit: null, timeLimitExpiry: null, timeLimitUpdatedAt: new Date() }
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
      attributes: ['limitId'],
      raw: true,
      transaction: sequelizeTransaction
    })
    if (checkLimitExist) {
      const createdLimit = await UserLimitModel.update(updateData, { where: { userId }, transaction: sequelizeTransaction })
      return { message: `${limitOption.charAt(0).toUpperCase() + limitOption.slice(1)} limit reset Successfully`, createdLimit }
    } else {
      return this.addError('NoUserLimitFoundErrorType')
    }
  }
}

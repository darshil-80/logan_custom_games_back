import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import bcrypt from 'bcrypt'
import { BREAK_TYPE } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    days: { type: 'number' },
    selfExclusionType: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['password', 'days']
}
const constraints = ajv.compile(schema)

/**
 * Provides service to user to set session limit
 * @export
 * @class PrimaryWalletService
 * @extends {ServiceBase}
*/

export default class SetUserAccountDisableLimitService extends ServiceBase {
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

    let { selfExclusionType, days, password } = this.args

    if (!selfExclusionType) selfExclusionType = BREAK_TYPE.TAKE_A_BREAK

    if (selfExclusionType === BREAK_TYPE.TAKE_A_BREAK) {
      if (days <= 0 || days > 30) return this.addError('TakeABreakDayErrorType')
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
      attributes: ['timeLimitExpiry'],
      raw: true,
      transaction: sequelizeTransaction
    })

    let createdLimit, message, selfExclusion, isSelfExclusionPermanent

    selfExclusion = new Date()
    selfExclusion.setDate(selfExclusion.getDate() + days)

    if (days === -1) {
      selfExclusion = null
      isSelfExclusionPermanent = true
      await UserModel.update({ active: false }, { where: { id: userId }, transaction: sequelizeTransaction })
    } else {
      isSelfExclusionPermanent = false
    }

    if (checkLimitExist) {
      createdLimit = await UserLimitModel.update({ selfExclusion, selfExclusionType, isSelfExclusionPermanent, selfExclusionUpdatedAt: new Date() }, { where: { userId }, transaction: sequelizeTransaction })
      message = 'Limit updated successfully'
    } else {
      createdLimit = await UserLimitModel.create({ userId, selfExclusion, selfExclusionType, isSelfExclusionPermanent, selfExclusionUpdatedAt: new Date() }, { transaction: sequelizeTransaction })
      message = 'Limit created successfully'
    }

    return { message, createdLimit }
  }
}

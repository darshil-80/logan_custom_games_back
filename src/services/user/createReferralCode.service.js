import config from '../../configs/app.config'
import ServiceBase from '../../libs/serviceBase'
import { nanoid } from 'nanoid'

/**
 * it provides service of generating the referral code.
 * @export
 * @class GenerateReferralService
 * @extends {ServiceBase}
 */
export default class CreateReferralCodeService extends ServiceBase {
  async run () {
    const {
      dbModels: { User: UserModel },
      sequelizeTransaction,
      auth: { id: userId }
    } = this.context

    const { referralCode } = this.args
    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    if (user.referralCode !== null && user.referralLink !== null) {
      return {
        message: 'Referral code already generated',
        user: user.toJSON()
      }
    }
    try {
      const code = user.referralCode = referralCode || nanoid(10)
      user.referralLink = `${config.get('user_frontend_app_url')}/signup?referralCode=${code}`
      await user.save({ transaction: sequelizeTransaction })
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', `user: ${user}`)
    }

    return { message: 'Referral code generated', user: user.toJSON() }
  }
}

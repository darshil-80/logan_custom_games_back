import axios from 'axios'
import { Op } from 'sequelize'
import { v4 as uuid } from 'uuid'
import config from '../../configs/app.config'
import ServiceBase from '../../libs/serviceBase'
import { EMAIL_TEMPLATE_CATEGORY } from '../../libs/constants'

/**
 * it provides service of forgot password for a user
 * @export
 * @class ForgotPasswordService
 * @extends {ServiceBase}
 */
export default class ForgotPasswordService extends ServiceBase {
  async run () {
    const {
      dbModels: { User: UserModel, UserToken: UserTokenModel, CrmTemplate: CrmTemplateModel },
      sequelizeTransaction
    } = this.context

    const whereObj = {
      [Op.or]: [
        {
          userName: this.args.userNameOrEmail?.toLowerCase?.()
        },
        {
          email: this.args.userNameOrEmail?.toLowerCase?.()
        }
      ]
    }

    const user = await UserModel.findOne({
      where: whereObj,
      transaction: sequelizeTransaction
    })

    if (!user) return this.addError('UserNotExistsErrorType', `user: ${user}`)

    if (!user.emailVerified) {
      return this.addError(
        'EmailNotVerifiedErrorType',
        `email: ${user.email}`
      )
    }

    const userToken = {
      token: uuid(),
      userId: user.id,
      tokenType: 'passwordReset'
    }

    try {
      await UserTokenModel.create(
        userToken,
        { transaction: sequelizeTransaction }
      )

      const crmTemplate = await CrmTemplateModel.findOne({
        where: { category: EMAIL_TEMPLATE_CATEGORY.RESET_PASSWORD },
        transaction: sequelizeTransaction
      })

      if (!crmTemplate) {
        this.addError('SomethingWentWrongErrorType', 'Email template not found.')
        return
      }

      const resetPasswordLink = `${config.get('user_frontend_app_url')}/reset-password/${user.id}/${userToken.token}`
      const emailData = {
        resetPasswordLink,
        appName: config.get('app.appName'),
        name: user.userName || 'User'
      }

      await axios.post(`${config.get('game_engine_url')}/api/v1/mail/send-mail`, {
        email: user.email,
        crmId: crmTemplate.id,
        emailDynamicData: emailData
      })
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', `user: ${userToken}`)
    }

    return { message: 'please check your email' }
  }
}

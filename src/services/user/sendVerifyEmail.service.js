import axios from 'axios'
import { v4 as uuid } from 'uuid'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import config from '../../configs/app.config'
import { EMAIL_TEMPLATE_CATEGORY } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string' }
  },
  required: ['email']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to signup the user
 * @export
 * @class SignupService
 * @extends {ServiceBase}
 */
export default class SendVerifyEmailService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        UserToken: UserTokenModel,
        CrmTemplate: CrmTemplateModel
      },
      sequelizeTransaction
    } = this.context

    const whereCondition = {
      email: this.args.email
    }

    const user = await UserModel.findOne({
      where: whereCondition,
      paranoid: false,
      transaction: sequelizeTransaction
    })

    if (!user) {
      return this.addError(
        'UserNotExistsErrorType',
        `email: ${this.args.email}`
      )
    }

    if (user.emailVerified === 'true') {
      return this.addError(
        'EmailAlreadyVerifiedErrorType',
        `email: ${this.args.email}`
      )
    }

    const token = uuid()

    try {
      await UserTokenModel.create(
        {
          token,
          userId: user.id,
          tokenType: 'email'
        },
        { transaction: sequelizeTransaction }
      )

      // verify user email
      const crmTemplate = await CrmTemplateModel.findOne({
        where: {
          category: EMAIL_TEMPLATE_CATEGORY.WELCOME_AND_VERIFY_EMAIL
        },
        transaction: sequelizeTransaction
      })

      if (!crmTemplate) {
        this.addError('SomethingWentWrongErrorType', 'Email template not found.')
        return
      }

      const verifyEmailUrl = `${config.get('user_frontend_app_url')}/verify/${user.id}/${token}`
      const emailData = {
        verifyEmailUrl,
        email: user.email,
        appName: config.get('app.appName'),
        name: user.userName || 'User'
      }

      await axios.post(`${config.get('game_engine_url')}/api/v1/mail/send-mail`, {
        email: user.email,
        crmId: crmTemplate.id,
        emailDynamicData: emailData
      })

      return {
        message: 'Email sent successfully'
      }
    } catch (e) {
      this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

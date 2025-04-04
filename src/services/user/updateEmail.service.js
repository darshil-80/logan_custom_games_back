import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import config from '../../configs/app.config'
import axios from 'axios'
import { EMAIL_TEMPLATE_CATEGORY } from '../../libs/constants'
import { setData } from '../../helpers/redis.helpers'
// import { v4 as uuid } from 'uuid'

const schema = {
  type: 'object',
  properties: {
    oldEmail: { type: 'string' },
    newEmail: { type: 'string' }
  },
  required: ['oldEmail', 'newEmail']
}

const constraints = ajv.compile(schema)

/**
 * Provides service for the change email functionality
 * @export
 * @class UpdateEmailService
 * @extends {ServiceBase}
 */

export default class UpdateEmailService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        CrmTemplate: CrmTemplateModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const currentUser = await UserModel.findOne({
      where: { id: userId },
      raw: true,
      transaction: sequelizeTransaction
    })

    if (currentUser.email !== this.args.oldEmail) {
      return this.addError('InvalidCredentialsErrorType')
    }

    const checkEmailExist = await UserModel.findOne({
      where: { email: this.args.newEmail },
      raw: true,
      transaction: sequelizeTransaction
    })

    if (checkEmailExist) {
      return this.addError('EmailAlreadyExist')
    }

    const crmTemplate = await CrmTemplateModel.findOne({
      where: { category: EMAIL_TEMPLATE_CATEGORY.UPDATE_EMAIL },
      transaction: sequelizeTransaction
    })

    if (!crmTemplate) {
      this.addError('SomethingWentWrongErrorType', 'Email template not found.')
      return
    }

    const OTP = (() => Math.floor(100000 + Math.random() * 900000).toString())()
    const userData = {
      OTP: OTP,
      email: this.args.newEmail
    }
    setData(userId, JSON.stringify(userData), 6000)

    const emailData = {
      email: this.args.newEmail,
      OTP,
      subject: crmTemplate.subject,
      appName: config.get('app.appName'),
      name: currentUser.userName || 'User'
    }

    await axios.post(`${config.get('game_engine_url')}/api/v1/mail/send-otp-mail`, {
      email: this.args.newEmail,
      crmId: crmTemplate.id,
      emailDynamicData: emailData
    })

    return {
      message: 'OTP Sent To New Email'
    }
  }
}

import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import config from '../../configs/app.config'
import axios from 'axios'
import { EMAIL_TEMPLATE_CATEGORY } from '../../libs/constants'
import { setData } from '../../helpers/redis.helpers'

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service for the change email functionality
 * @export
 * @class UpdateEmailService
 * @extends {ServiceBase}
 */

export default class UpdateMetamaskUserEmailService extends ServiceBase {
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

    if (!currentUser.email) {
      const checkEmailExist = await UserModel.findOne({
        where: { email: this.args.email },
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
        email: this.args.email
      }
      setData(userId, JSON.stringify(userData), 6000)

      const emailData = {
        email: this.args.email,
        OTP,
        subject: crmTemplate.subject,
        appName: config.get('app.appName'),
        name: currentUser.userName || 'User'
      }

      await axios.post(`${config.get('game_engine_url')}/api/v1/mail/send-otp-mail`, {
        email: this.args.email,
        crmId: crmTemplate.id,
        emailDynamicData: emailData
      })

      return {
        message: 'OTP Sent To New Email'
      }
    } else {
      return {
        message: 'Email is already Updated'
      }
    }
  }
}

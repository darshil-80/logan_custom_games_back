import ServiceBase from '../../libs/serviceBase'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

/**
 * it provides service of generating the secret and QR code for 2 factor authorization
 * @export
 * @class GenerateSecretCodeService
 * @extends {ServiceBase}
 */
export default class GenerateSecretCodeService extends ServiceBase {
  async run () {
    const {
      dbModels: { User: UserModel },
      sequelizeTransaction,
      auth: { id: userId }
    } = this.context

    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    if (!user) {
      return this.addError('UserNotExistsErrorType', 'User Not Found')
    }

    // saving secret_key in user model
    const secret = speakeasy.generateSecret()
    user.twoFactorSecretKey = secret.base32

    try {
      await user.save({ transaction: sequelizeTransaction })
      const dataURL = await qrcode.toDataURL(secret.otpauth_url)

      return {
        dataURL,
        appToken: secret.base32
      }
    } catch (err) {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

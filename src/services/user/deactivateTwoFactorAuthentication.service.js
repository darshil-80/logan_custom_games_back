import ServiceBase from '../../libs/serviceBase'

/**
 * Service to disable 2 factor authentication for user
 * @export
 * @class DeactivateTwoFactorAuthenticationService
 * @extends {ServiceBase}
 */
export default class DeactivateTwoFactorAuthenticationService extends ServiceBase {
  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const user = await UserModel.findOne({
      where: { id: userId },
      transaction: sequelizeTransaction
    })

    if (!user) return this.addError('UserNotExistsErrorType', 'User Not Found')

    user.twoFactorEnabled = false
    user.twoFactorSecretKey = null
    await user.save({ transaction: sequelizeTransaction })
    return { message: '2FA deactivated Successfully', user: user.toJSON() }
  }
}

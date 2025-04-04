import { removeData } from '../../helpers/redis.helpers'
import ServiceBase from '../../libs/serviceBase'
import { getUserTokenCacheKey } from '../../utils/user.utils'

/**
 * Provides service to log the user out
 * @export
 * @class LogoutService
 * @extends {ServiceBase}
 */
export default class LogoutService extends ServiceBase {
  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId }
    } = this.context

    const user = await UserModel.findOne({ where: { id: userId } })

    // delete token from redis
    const cacheTokenKey = getUserTokenCacheKey(user.id)
    removeData(cacheTokenKey)

    await user.save()
    return { Id: user.id, message: 'Logout successfully' }
  }
}

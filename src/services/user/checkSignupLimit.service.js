import ServiceBase from '../../libs/serviceBase'
import {
  convertProperty,
  REGISTERED_USER_LIMIT_FILTER_PROPERTY,
  REGISTERED_USER_LIMIT_PROPERTY
} from '../../utils/properties.utils'
import { Op } from 'sequelize'

/**
 * It checks if the user exists in the database, if it does, it returns a nonce, if it doesn't, it returns a common nonce
 * @export
 * @class CheckUserAddressService
 * @extends {ServiceBase}
 */
export default class CheckSignupLimitService extends ServiceBase {
  get constraints () {
    return null
  }

  async run () {
    const {
      dbModels: { User, Property },
      sequelizeTransaction,
      register = false
    } = this.context

    const usersLimit = convertProperty(await Property.findOne({
      where: {
        key: REGISTERED_USER_LIMIT_PROPERTY
      },
      ...(register
        ? {
            transaction: sequelizeTransaction,
            lock: {
              level: sequelizeTransaction.LOCK.UPDATE,
              of: Property
            }
          }
        : {})
    }))

    const usersLimitFilter = convertProperty(await Property.findOne({
      where: {
        key: REGISTERED_USER_LIMIT_FILTER_PROPERTY
      }
    }))

    const usersCount = await User.count({
      where: {
        email: {
          [Op.notILike]: {
            [Op.all]: usersLimitFilter.value
          }
        }
      }
    })

    console.log(usersCount, usersLimit.value, usersCount >= usersLimit.value)
    return usersCount >= usersLimit.value
  }
}

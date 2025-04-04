import _ from 'lodash'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    userName: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]*$',
      minLength: 2,
      maxLength: 50
    },
    firstName: {
      type: 'string',
      pattern: '^[a-zA-Z]*$',
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      type: 'string',
      pattern: '^[a-zA-Z]*$',
      minLength: 2,
      maxLength: 50
    },
    dateOfBirth: {
      type: 'string'
    },
    signInIp: {
      type: 'string'
    },
    gender: {
      type: 'string'
      // inclusion: ['male', 'female', 'other']
    },
    locale: {
      type: 'string',
      pattern: '^[a-zA-Z]*$',
      minLength: 2,
      maxLength: 30
    }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service for the updating user profile functionality
 * @export
 * @class UpdateProfileService
 * @extends {ServiceBase}
 */
export default class UpdateProfileService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const userObj = {
      userName: this.args?.userName?.toLowerCase?.(),
      firstName: this.args.firstName,
      lastName: this.args.lastName,
      dateOfBirth: this.args?.dateOfBirth,
      signInIp: this.args.signInIp,
      gender: this.args.gender,
      locale: this.args.locale
    }

    if (userObj.userName) {
      const userDetail = await UserModel.findOne({
        where: {
          userName: userObj.userName
        }
      },
      { transaction: sequelizeTransaction }
      )

      if (userDetail && userDetail.id !== userId) {
        return this.addError(
          'UserNameAlreadyTakenErrorType',
        `UserId : ${userObj.userName}`
        )
      }
    }

    if (
      userObj.dateOfBirth &&
      new Date(new Date().setUTCFullYear(new Date().getUTCFullYear() - 18)) <
      new Date(userObj.dateOfBirth)
    ) {
      return this.addError(
        'UserNotAbove18YearsErrorType',
        `User age: ${userObj.dateOfBirth}`
      )
    }

    const user = await UserModel.update(_(userObj).omit(_.isUndefined).omit(_.isNull).value(), {
      where: { id: userId },
      individualHooks: true,
      transaction: sequelizeTransaction
    })

    if (!user) {
      return this.addError('UserNotExistsErrorType', `userId: ${userId}`)
    }

    const { firstName, lastName, userName, signInIp, gender, locale, dateOfBirth } = user

    return {
      firstName,
      lastName,
      dateOfBirth,
      userName,
      signInIp,
      gender,
      locale,
      message: 'User Profile updated'
    }
  }
}

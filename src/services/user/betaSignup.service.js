import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'

const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string'
    },
    telegram: {
      type: 'string'
    },
    twitter: {
      type: 'string'
    }
  },
  required: ['email']
}

const constraints = ajv.compile(schema)

/**
 * It checks if the user exists in the database, if it does, it returns a nonce, if it doesn't, it returns a common nonce
 * @export
 * @class CheckUserAddressService
 * @extends {ServiceBase}
 */
export default class BetaSignupService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { BetaWaitlist }
    } = this.context

    const userObj = {
      email: this.args?.email?.toLowerCase?.(),
      twitter: this.args?.twitter,
      telegram: this.args?.telegram
    }

    await BetaWaitlist.create(userObj)

    return {
      message: 'User successfully registered'
    }
  }
}

import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import config from '../../configs/app.config'
import { LINKED_METHODS } from '../../libs/constants'
import axios from 'axios'

const schema = {
  type: 'object',
  properties: {
    code: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * it provides service of linked with twitch for a user
 * @export
 * @class LinkedWithTwitchService
 * @extends {ServiceBase}
 */
export default class LinkedWithTwitchService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        LinkedSocialAccount: LinkedSocialAccountModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const code = this.args.code

    const twitchLoginData = {
      client_id: config.get('twitch_login.client_id'),
      client_secret: config.get('twitch_login.client_secret'),
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.get('twitch_linked_frontend_app_url')
    }

    const twitchDetails = await axios.post('https://id.twitch.tv/oauth2/token', twitchLoginData)
    const { access_token: accessToken } = twitchDetails.data

    const userDetails = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': config.get('twitch_login.client_id')
      }
    })

    const { data } = userDetails.data
    const userData = data[0]

    const userObj = {
      socialAccount: LINKED_METHODS.TWITCH,
      username: userData.display_name,
      actioneeId: userId,
      status: true
    }

    const linkedAccounts = await LinkedSocialAccountModel.create(userObj, {
      transaction: sequelizeTransaction
    })

    return { linkedAccounts }
  }
}

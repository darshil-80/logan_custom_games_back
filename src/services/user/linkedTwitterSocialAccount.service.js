import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { LINKED_METHODS } from '../../libs/constants'
import axios from 'axios'

const schema = {
  type: 'object',
  properties: {
    oauthToken: { type: 'string' },
    oauthVerifier: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * it provides service of linked with twitter service for a user
 * @export
 * @class LinkedWithTwitterService
 * @extends {ServiceBase}
 */
export default class LinkedWithTwitterService extends ServiceBase {
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

    const { oauthToken, oauthVerifier } = this.args

    const twitterDetails = await axios.post(`https://api.twitter.com/oauth/access_token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)

    const params = twitterDetails.data.split('&')
    const tokenObject = {}
    params.forEach(param => {
      const [key, value] = param.split('=')
      tokenObject[key] = value
    })
    const screenName = tokenObject.screen_name

    const userObj = {
      socialAccount: LINKED_METHODS.TWITTER,
      username: screenName,
      actioneeId: userId,
      status: true
    }

    const linkedAccounts = await LinkedSocialAccountModel.create(userObj, {
      transaction: sequelizeTransaction
    })

    return { linkedAccounts }
  }
}

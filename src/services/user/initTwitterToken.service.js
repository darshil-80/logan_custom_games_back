import ServiceBase from '../../libs/serviceBase'
import axios from 'axios'
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import config from '../../configs/app.config'

/**
 * it provides service of linked with twitter for a user getting oauth token
 * @export
 * @class InitTwitterTokenService
 * @extends {ServiceBase}
 */
export default class InitTwitterTokenService extends ServiceBase {
  async run () {
    let browserUrl
    const consumerKey = config.get('twitter.api_key')
    const consumerSecret = config.get('twitter.api_key_secret')

    const oauth = OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function (baseString, key) {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64')
      }
    })

    // Twitter OAuth request token URL
    const requestTokenUrl = 'https://api.twitter.com/oauth/request_token'

    // Prepare OAuth request data
    const requestData = {
      url: requestTokenUrl,
      method: 'POST'
    }

    // Generate OAuth signature
    const oauthSignature = oauth.authorize(requestData)

    // Convert OAuth signature to a string for the Authorization header
    const authorizationHeader = oauth.toHeader(oauthSignature)

    // Make the request with Axios
    return new Promise((resolve, reject) => {
      axios.post(requestTokenUrl, null, {
        headers: {
          ...authorizationHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          const oauthToken = response.data
          browserUrl = `https://api.twitter.com/oauth/authorize?${oauthToken}`
          resolve(browserUrl)
        })
        .catch(error => {
          console.error('Error:', error.response ? error.response.data : error.message)
          reject(error)
        })
    })
  }
}

import axios from 'axios'
import config from '../configs/app.config'
import crypto from 'crypto'
import FormData from 'form-data'

// Signature creation
export const createSignature = ({ method, url, header = null, data = null }) => {
  try {
    console.log('Creating a signature for the request...')

    const timeStamp = Math.floor(Date.now() / 1000)
    const signature = crypto.createHmac('sha256', config.get('kyc_verification.sumsub_secret_key'))
    signature.update(timeStamp + method.toUpperCase() + url)

    if (data instanceof FormData) {
      signature.update(data.getBuffer())
    } else if (data) {
      signature.update(data)
    }

    const axiosConfig = {
      method: method,
      url: `${config.get('kyc_verification.base_api_url')}${url}`,
      headers: {
        'X-App-Token': config.get('kyc_verification.sumsub_app_token'),
        'X-App-Access-Sig': signature.digest('hex'),
        Accept: 'application/json',
        'X-App-Access-Ts': `${timeStamp}`
      }
    }

    if (header) {
      axiosConfig.headers = { ...axiosConfig.headers, ...header }
    }

    if (data) {
      axiosConfig.data = data
    }

    return axiosConfig
  } catch (error) {
    console.log(error, 'err------------------------------')
  }
}

// To create access token for WEBSDK
export const createAccessToken = async ({ externalUserId, levelName, ttlInSecs = 1200 }) => {
  console.log('Creating an access token for initializng SDK...')

  const method = 'post'
  const url = `/resources/accessTokens?userId=${externalUserId}&levelName=${levelName}&ttlInSecs=${ttlInSecs}`
  console.log('url-----------------', url)
  try {
    const response = await axios(createSignature({ method, url }))
    console.log(JSON.stringify(response.data))
    return response.data
  } catch (error) {
    console.log(error)
  }
}

import { verify } from 'coinpayments-ipn'
import _ from 'lodash'
import config from '../../configs/app.config'

/**
 *
 * @memberof Rest Middleware
 * @export
 * @name validateCoinPaymentIPNMiddleware
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*}
 */
export default function validateCoinPaymentIPNMiddleware (req, res, next) {
  let isValid

  const ipnSecret = config.get('coin_payments.ipn_secret')
  const merchantId = config.get('coin_payments.merchant_id')

  if (_.isEmpty(req.headers.hmac)) {
    req?.context?.logger.error('Invalid request', { message: 'No HMAC signature sent' })
    return next(new Error('Invalid request'))
  }

  if (_.isEmpty(req.body)) {
    req?.context?.logger.error('Invalid request', { message: 'Error reading POST data' })
    return next(new Error('Error reading POST data'))
  }

  if (_.isEmpty(req.body.merchant)) {
    req?.context?.logger.error('Invalid request', { message: 'No Merchant ID passed' })
    return next(new Error('Invalid request'))
  }

  if (merchantId !== req.body.merchant) {
    req?.context?.logger.error('Invalid request', { message: 'Invalid Merchant ID' })
    return next(new Error('Invalid request'))
  }

  try {
    isValid = verify(req.headers.hmac, ipnSecret, req.body)

    if (!isValid) {
      return next(new Error('HMAC does not match'))
    }
  } catch (e) {
    return next(e)
  }

  return next()
}

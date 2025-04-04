/**
 *
 * @namespace Rest Middleware
 */
import crypto from 'crypto'
import { InvalidSignatureErrorType, MoonpaySignatureIsMissingErrorType } from '../../libs/errorTypes'
import config from '../../configs/app.config'

/**
 *
 * @memberof Rest Middleware
 * @export
 * @name moonpayAuthenticationMiddleware
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export default async function moonpayAuthenticationMiddleware (req, res, next) {
  try {
    const moonpaySignature = req.headers['moonpay-signature-v2']

    if (!moonpaySignature) {
      return next(MoonpaySignatureIsMissingErrorType)
    }
    const WEBHOOK_SECRET = config.digest('moonpay.moonpay_webhook_key')

    const signatureParts = moonpaySignature.split(',')
    const timestamp = signatureParts.find(part => part.startsWith('t=')).split('=')[1]
    const receivedSignature = signatureParts.find(part => part.startsWith('s=')).split('=')[1]

    const payload = `${timestamp}.${JSON.stringify(req.body)}`

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
    const expectedSignature = hmac.update(payload).digest('hex')

    if (crypto.timingSafeEqual(Buffer.from(receivedSignature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      next()
    } else {
      return next(InvalidSignatureErrorType)
    }
  } catch (err) {
    req.context.logger.error('Error in moonpay authentication middleware', {
      message: err.message,
      context: {
        traceId: req?.context?.traceId,
        query: req.query,
        params: req.params,
        body: req.body,
        headers: req.headers
      },
      exception: err
    })

    next(MoonpaySignatureIsMissingErrorType)
  }
}

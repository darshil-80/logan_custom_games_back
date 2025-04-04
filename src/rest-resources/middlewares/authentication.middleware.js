/**
 *
 * @namespace Rest Middleware
 */
import jwt from 'jsonwebtoken'
import config from '../../configs/app.config'
import { getCachedData } from '../../helpers/redis.helpers'
import { GAME_ROUTE_ENDPOINTS } from '../../libs/constants'
import { InvalidTokenErrorType } from '../../libs/errorTypes'
import { getUserTokenCacheKey } from '../../utils/user.utils'

/**
 *
 * @memberof Rest Middleware
 * @export
 * @name authenticationMiddleWare
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export default async function authenticationMiddleWare (req, res, next) {
  try {
    const url = req.originalUrl.split('?').slice(0, 1).toString()
    const endPoint = url.split('/').slice(-2).join('/').toString()

    if (req.headers['demo-game'] === 'true' && GAME_ROUTE_ENDPOINTS.includes(endPoint)) {
      req.body.demo = true
      req.query.demo = true
      return next()
    }

    const jwtToken = req.headers.authorization?.split(' ')[1]

    if (!jwtToken) {
      return next(InvalidTokenErrorType)
    }

    let jwtDecoded = {}

    jwtDecoded = jwt.verify(jwtToken, config.get('jwt.loginTokenSecret'))

    req.context.auth = jwtDecoded || {}

    const cachedToken = await getCachedData(getUserTokenCacheKey(jwtDecoded.id))

    if (!cachedToken || cachedToken !== jwtToken) {
      next(InvalidTokenErrorType)
    }

    next()
  } catch (err) {
    req.context.logger.error('Error in authenticationMiddleware', {
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

    next(InvalidTokenErrorType)
  }
}

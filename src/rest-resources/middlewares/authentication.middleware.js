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
import inMemoryDB from '../../libs/inMemoryDb'

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
    let jwtDecoded = await inMemoryDB.get('users', req.headers.userid)
    console.log("jwtDecodedjwtDecoded", req?.context?.auth);
    req.context.auth = jwtDecoded || {}
    console.log("jwtDecodedjwtDecoded", req?.context?.auth);

    // const cachedToken = await getCachedData(getUserTokenCacheKey(jwtDecoded.id))

    // if (!cachedToken || cachedToken !== jwtToken) {
    //   next(InvalidTokenErrorType)
    // }

    next()
  } catch (err) {
    console.error('Error in authenticationMiddleware', {
      message: err.message,
      // context: {
      //   // traceId: req?.context?.traceId,
      //   query: req.query,
      //   params: req.params,
      //   body: req.body,
      //   headers: req.headers
      // },
      exception: err
    })

    next(InvalidTokenErrorType)
  }
}

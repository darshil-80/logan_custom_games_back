import { nanoid } from 'nanoid'
import ajv from '../../libs/ajv'
import config from '../../configs/app.config'
import ServiceBase from '../../libs/serviceBase'
import { getCachedData, setData } from '../../helpers/redis.helpers'
import { getProviderUserTokenCacheKey } from '../../utils/user.utils'

const schema = {
  type: 'object',
  properties: {
    gameId: { type: 'string' },
    demo: { type: 'string' },
    mobile: { type: 'string' },
    lang: { type: 'string' }
  },
  required: ['gameId', 'demo']
}

const constraints = ajv.compile(schema)
/**
 * This service generates Nux game play link for the user
 * @export
 * @class StartNuxGameService
 * @extends {ServiceBase}
 */
export default class StartNuxGameService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { gameId, demo, lang, mobile } = this.args
    const { auth: { id: userId } } = this.context

    const NUX_GAME_URL = config.get('nux_game.url')
    const NUX_GAME_EXIT_URL = config.get('nux_game.exit_url')

    let token = await getCachedData(getProviderUserTokenCacheKey(userId))

    if (!token) {
      // set nux game token in redis
      token = nanoid(16)
      const providerUserCacheTokenKey = getProviderUserTokenCacheKey(userId)
      await setData(providerUserCacheTokenKey, token, config.get('nux_game.token_expiry'))
    }

    const ip = (this.context.req.headers['x-forwarded-for'] || '').split(',')[0] || this.context.req.connection.remoteAddress

    let link = NUX_GAME_URL + `/start?gameId=${gameId}&token=${token}&demo=${demo}&userId=${userId}&exiturl=${NUX_GAME_EXIT_URL}`

    // Constant for now
    const country = 'US'

    if (lang) link += `&lang=${lang}`
    if (mobile) link += `&mobile=${mobile}`
    if (ip) link += `&ip=${ip}`
    if (country) link += `&country=${country}`

    return { link }
  }
}

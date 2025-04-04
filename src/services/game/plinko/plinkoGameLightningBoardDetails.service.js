import { getCachedData, setData } from '../../../helpers/redis.helpers'
import ajv from '../../../libs/ajv'
import { DEFAULT_PLINKO_LIGHTNING_MODE_BOARD } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import { getLightningBoardCacheKey } from '../../../utils/user.utils'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string' },
    offset: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class PlinkoGameLightningBoardDetails
 * @extends {ServiceBase}
 */
export default class PlinkoGameLightningBoardDetails extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const cachedLightningBoard = await getCachedData(getLightningBoardCacheKey())

    if (cachedLightningBoard) {
      const lightningBoardDetails = JSON.parse(cachedLightningBoard)
      return {
        lightningBoardDetails
      }
    }
    await setData(getLightningBoardCacheKey(), JSON.stringify(DEFAULT_PLINKO_LIGHTNING_MODE_BOARD), 7200)
    return {
      lightningBoardDetails: DEFAULT_PLINKO_LIGHTNING_MODE_BOARD
    }
  }
}

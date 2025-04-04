import { CRASH_GAME } from '../../../libs/constants'
import { crashGameResult } from '../../../utils/game.utils'
import md5 from 'md5'
import ServiceBase from '../../../libs/serviceBase'
import ajv from '../../../libs/ajv'

const schema = {
  type: 'object',
  properties: {
    roundHash: { type: 'string' },
    signature: { type: 'string' }
  },
  required: ['roundHash']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to check crash game provable fair
 * @export
 * @class CheckProvableFairService
 * @extends {ServiceBase}
 */
export default class CheckProvableFairService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        CrashGameRoundDetail: CrashGameRoundDetailModel
      },
      sequelizeTransaction
    } = this.context

    const { roundHash } = this.args

    const roundDetails = await CrashGameRoundDetailModel.findOne({
      where: {
        roundHash
      },
      transaction: sequelizeTransaction
    })

    if (!roundDetails) {
      return this.addError('InvalidRoundHashErrorType', `roundHash : ${roundHash}`)
    }

    const settings = JSON.parse(roundDetails.dataValues.currentGameSettings)
    const result = crashGameResult(roundHash, CRASH_GAME.CLIENT_SEED, settings)

    const hashStr = `${parseFloat(result).toFixed(2)}-${roundHash}`
    const sign = md5(hashStr)

    return { crashRate: result, signature: sign }
  }
}

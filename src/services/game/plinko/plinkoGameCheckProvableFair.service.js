import ajv from '../../../libs/ajv'
import { PLINKO_GAME_FIXED_ODDS } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import { countOnes } from '../../../utils/math.utils'
import PlinkoGameGenerateResultService from './plinkoGameGenerateResult.service'

const schema = {
  type: 'object',
  properties: {
    serverSeed: { type: 'string' },
    clientSeed: { type: 'string' },
    numberOfRows: { type: 'number' },
    riskLevel: { type: 'number' }
  },
  required: ['serverSeed', 'clientSeed', 'numberOfRows', 'riskLevel']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to check provable fair
 * @export
 * @class PlinkoGameCheckProvableFairService
 * @extends {ServiceBase}
 */
export default class PlinkoGameCheckProvableFairService extends ServiceBase {
  get constraints () {
    return constraints
  }

  // Provable fair not implemented for lightning mode
  async run () {
    const {
      args: { serverSeed, clientSeed, numberOfRows, riskLevel }
    } = this

    if (riskLevel > 3 || riskLevel < 1) return this.addError('InvalidRiskLevelErrorType')

    const plinkoGameResult = await PlinkoGameGenerateResultService.run({ serverSeed, clientSeed, numberOfRows })

    const odds = PLINKO_GAME_FIXED_ODDS[numberOfRows][(riskLevel - 1)][countOnes(plinkoGameResult)]

    return { multiplier: odds }
  }
}

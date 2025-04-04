import crypto from 'crypto'
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class DiceGameGenerateResultService
 * @extends {ServiceBase}
 */
export default class DiceGameGenerateResultService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const nBits = 32 // number of most significant bits to use

    const hmac = crypto.createHmac('sha256', this.args.serverSeed)
    hmac.update(this.args.clientSeed)

    let seed = hmac.digest('hex')
    seed = seed.slice(0, nBits / 4)

    const decimalNumber = parseInt(seed, 16)

    const probability = decimalNumber / Math.pow(2, nBits) // uniformly distributed in [0; 1)

    const result = parseInt(probability * 101)

    return result
  }
}

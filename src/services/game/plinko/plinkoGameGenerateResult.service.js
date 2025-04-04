import crypto from 'crypto'
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' },
    numberOfRows: { type: 'number' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class PlinkoGameGenerateResultService
 * @extends {ServiceBase}
 */
export default class PlinkoGameGenerateResultService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const nBits = 32 // number of most significant bits to use

    let result = ''

    for (let i = 0; i < this.args.numberOfRows; i++) {
      const hmac = crypto.createHmac('sha256', this.args.serverSeed)
      hmac.update(`${this.args.clientSeed}-${i + 1}`)

      let seed = hmac.digest('hex')
      seed = seed.slice(0, nBits / 4) // For more variability we are using 16 bits

      const decimalNumber = parseInt(seed, 16)

      const probability = decimalNumber / Math.pow(2, nBits) // uniformly distributed in [0; 1)

      const number = parseInt(probability * 2) // because we need zero based index

      result += `${number}`
    }

    return result
  }
}

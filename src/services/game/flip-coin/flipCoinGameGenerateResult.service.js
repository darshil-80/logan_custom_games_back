import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import crypto from 'crypto'

const schema = {
  type: 'object',
  properties: {
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' },
    numberOfCoins: { type: 'number' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class FlipCoinGameGenerateResult
 * @extends {ServiceBase}
 */
export default class FlipCoinGameGenerateResultService extends ServiceBase {
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

    const result = Number(decimalNumber).toString(2).slice(-this.args.numberOfCoins)

    return result
  }
}

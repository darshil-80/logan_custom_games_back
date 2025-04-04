import crypto from 'crypto'
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' },
    mineCount: { type: 'number' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class MineGameGenerateResultService
 * @extends {ServiceBase}
 */
export default class MineGameGenerateResultService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { serverSeed, clientSeed, mineCount } = this.args

    // list of number of tiles in mine game
    const mines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]

    const nBits = 52 // number of most significant bits to use

    for (let currentMine = 0; currentMine < (mineCount || mines.length); currentMine++) {
      const hmac = crypto.createHmac('sha256', serverSeed)

      // using currentMine as nonce
      hmac.update(clientSeed + '-' + currentMine)

      let seed = hmac.digest('hex')
      seed = seed.slice(0, nBits / 4)

      const decimalNumber = parseInt(seed, 16)
      const probability = decimalNumber / (Math.pow(2, nBits)) // uniformly distributed in [0; 1)
      const randomMine = currentMine + parseInt(probability * (mines.length - currentMine));

      [mines[currentMine], mines[randomMine]] = [mines[randomMine], mines[currentMine]]
    }

    return mines.slice(0, mineCount)
  }
}

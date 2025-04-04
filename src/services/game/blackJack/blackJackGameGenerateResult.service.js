import crypto from 'crypto'
import ajv from '../../../libs/ajv'
import { CARD_DECK } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' },
    totalCards: { type: 'number' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class BlackJackGameGenerateResultService
 * @extends {ServiceBase}
 */
export default class BlackJackGameGenerateResultService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { clientSeed, serverSeed, totalCards } = this.args
    // Combine the client seed and totalCards
    const combinedSeed = clientSeed + totalCards

    // Generate a hash using SHA-256
    const hmac = crypto.createHmac('sha256', serverSeed)
    hmac.update(combinedSeed)

    // Convert the hash to a number between 0 and 1
    const hashValue = parseInt(hmac.digest('hex'), 16) / 2 ** 256

    // Map the hash value to the range of 1 to 312 using the modulo operator
    const number = Math.floor(hashValue * totalCards) + 1

    let cardNumber = number % 52

    if (cardNumber === 0) cardNumber = 52

    return CARD_DECK[cardNumber]
  }
}

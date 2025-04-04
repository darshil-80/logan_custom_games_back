import ServiceBase from '../../../libs/serviceBase'
import ajv from '../../../libs/ajv'
import FlipCoinGameGenerateResultService from './flipCoinGameGenerateResult.service'

const schema = {
  type: 'object',
  properties: {
    serverSeed: { type: 'string' },
    clientSeed: { type: 'string' },
    numberOfCoins: { type: 'number' }
  },
  required: ['clientSeed', 'serverSeed', 'numberOfCoins']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to check flip coin game provable fair
 * @export
 * @class CheckProvableFairService
 * @extends {ServiceBase}
 */
export default class FlipCoinGameCheckProvableFairService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      args: { serverSeed, clientSeed, numberOfCoins }
    } = this

    const flipCoinGameResult = (await FlipCoinGameGenerateResultService.execute({ serverSeed, clientSeed, numberOfCoins })).result

    return { result: flipCoinGameResult }
  }
}

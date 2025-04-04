import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import HiLoGameGenerateResultService from './hiLoGameGenerateResult.service'

const schema = {
  type: 'object',
  properties: {
    serverSeed: { type: 'string' },
    clientSeed: { type: 'string' }
  },
  required: ['serverSeed', 'clientSeed']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to check provable fair
 * @export
 * @class HiloGameCheckProvableFairService
 * @extends {ServiceBase}
 */
export default class HiloGameCheckProvableFairService extends ServiceBase {
  get constraints () {
    return constraints
  }

  // Provable fair not implemented for lightning mode
  async run () {
    const {
      args: { serverSeed, clientSeed }
    } = this

    const shuffledDeck = []

    for (let i = 0; i < 52; i++) {
      shuffledDeck.push(
        await HiLoGameGenerateResultService.run({
          clientSeed: `${clientSeed}-${i}`,
          serverSeed
        }, this.context)
      )
    }

    return { shuffledDeck }
  }
}

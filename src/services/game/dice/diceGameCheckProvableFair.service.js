import ServiceBase from '../../../libs/serviceBase'
import ajv from '../../../libs/ajv'
import DiceGameGenerateResultService from './diceGameGenerateResult.service'

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
 * Provides service to check dice game provable fair
 * @export
 * @class CheckProvableFairService
 * @extends {ServiceBase}
 */
export default class DiceGameCheckProvableFairService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { serverSeed, clientSeed } = this.args

    const diceGameResult = (await DiceGameGenerateResultService.execute({ serverSeed, clientSeed })).result

    return { result: diceGameResult }
  }
}

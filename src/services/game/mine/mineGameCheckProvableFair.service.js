import ServiceBase from '../../../libs/serviceBase'
import ajv from '../../../libs/ajv'
import MineGameGenerateResultService from './mineGameGenerateResult.service'

const schema = {
  type: 'object',
  properties: {
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' }
  },
  required: ['clientSeed', 'serverSeed']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to check crash game provable fair
 * @export
 * @class MineGameCheckProvableFairService
 * @extends {ServiceBase}
 */
export default class MineGameCheckProvableFairService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        MineGameBet: MineGameBetModel
      },
      sequelizeTransaction
    } = this.context

    const { clientSeed, serverSeed } = this.args

    const mineGameBet = await MineGameBetModel.findOne({
      where: {
        clientSeed,
        serverSeed
      },
      transaction: sequelizeTransaction
    })

    if (!mineGameBet) {
      return this.addError('InvalidSeedsErrorType', `Provided seeds are not related to any bet : ${clientSeed} ${serverSeed}`)
    }

    const result = await MineGameGenerateResultService.run({ clientSeed, serverSeed, mineCount: mineGameBet.mineCount }, this.context)

    return {
      clientSeed,
      serverSeed,
      mines: result
    }
  }
}

import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'number' },
    offset: { type: 'number' }
  }
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class GetUnfinishedBetService
 * @extends {ServiceBase}
 */
export default class GetUnfinishedBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        HiLoGameBet: HiLoGameBetModel,
        HiLoGameBetState: HiLoGameBetStateModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const hiLoGameUnfinishedBet = await HiLoGameBetModel.findOne({
      where: {
        userId,
        result: null
      },
      transaction: sequelizeTransaction,
      include: [{
        model: HiLoGameBetStateModel,
        as: 'betStates'
      }]
    })

    if (!hiLoGameUnfinishedBet) {
      return {
        hasUnfinishedBet: false
      }
    }

    return {
      hasUnfinishedBet: true,
      unfinishedBet: hiLoGameUnfinishedBet
    }
  }
}

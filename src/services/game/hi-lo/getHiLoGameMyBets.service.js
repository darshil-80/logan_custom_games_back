import { BET_RESULT } from '../../../libs/constants'
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
 * @class GetHiLoGameMyBetsService
 * @extends {ServiceBase}
 */
export default class GetHiLoGameMyBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        HiLoGameBet: HiLoGameBetModel,
        HiLoGameBetState: HiLoGameBetStateModel,
        User: UserModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const hiLoBets = await HiLoGameBetModel.findAndCountAll({
      where: {
        userId,
        result: [BET_RESULT.WON, BET_RESULT.LOST]
      },
      order: [['createdAt', 'DESC']],
      limit: this.args.limit,
      offset: this.args.offset,
      transaction: sequelizeTransaction,
      include: [{
        model: UserModel,
        as: 'user'
      }, {
        model: HiLoGameBetStateModel,
        as: 'betStates'
      }]
    })

    return {
      count: hiLoBets.count,
      rows: hiLoBets.rows.map(hiLoBet => hiLoBet?.toJSON()) || []
    }
  }
}

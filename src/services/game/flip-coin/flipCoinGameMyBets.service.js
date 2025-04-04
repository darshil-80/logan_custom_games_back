import ajv from '../../../libs/ajv'
import { BET_RESULT } from '../../../libs/constants'
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
 * @class GetFlipCoinGameMyBetsService
 * @extends {ServiceBase}
 */
export default class GetFlipCoinGameMyBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        FlipCoinGameBet: FlipCoinGameBetModel,
        User: UserModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    const flipCoinGameBet = await FlipCoinGameBetModel.findAndCountAll({
      where: {
        userId,
        result: [BET_RESULT.WON, BET_RESULT.LOST]
      },
      limit: 10,
      order: [['createdAt', 'DESC']],
      transaction: sequelizeTransaction,
      include: [{
        model: UserModel,
        as: 'user'
      }]
    })

    return {
      count: flipCoinGameBet.count,
      rows: flipCoinGameBet.rows.map(flipCoinGameBet => flipCoinGameBet?.toJSON()) || []
    }
  }
}

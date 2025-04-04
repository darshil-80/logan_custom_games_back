import { BET_RESULT } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
/**
 * @export
 * @class GetMineGameTopBetsService
 * @extends {ServiceBase}
 */
export default class GetMineGameTopBetsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        MineGameBet: MineGameBetModel
      },
      sequelizeTransaction,
      sequelize
    } = this.context

    const limit = 50

    const mineGameBets = await MineGameBetModel.findAll({
      attributes: ['userId', [sequelize.literal('COALESCE(SUM(bet_amount), 0)'), 'totalBetAmount'], [sequelize.literal('COALESCE(SUM(winning_amount), 0)'), 'totalWinAmount']],
      where: {
        result: [BET_RESULT.WON, BET_RESULT.LOST]
      },
      limit,
      group: 'user_id',
      order: [[sequelize.literal('"totalWinAmount"'), 'DESC']],
      transaction: sequelizeTransaction
    })

    return {
      topBets: mineGameBets
    }
  }
}

import { Sequelize } from '../../../db/models'
import { BET_RESULT } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class CrashGameGetAllRoundPlacedBetsService
 * @extends {ServiceBase}
 */
export default class CrashGameGetAllRoundPlacedBetsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        CrashGameBet: CrashGameBetModel,
        User: UserModel
      },
      sequelizeTransaction
    } = this.context

    const whereCondition = {
      roundId: this.args.roundId,
      result: { [Sequelize.Op.or]: [BET_RESULT.LOST, BET_RESULT.WON] }
    }

    const bets = await CrashGameBetModel.findAll({
      where: whereCondition,
      attributes: ['id', 'userId', 'autoRate', 'escapeRate', 'betAmount', 'winningAmount', 'result', 'currencyId', 'gameId'],
      include: { model: UserModel, as: 'user', attributes: ['userName'] },
      transaction: sequelizeTransaction
    })

    const jsonBets = bets.map(bet => bet?.toJSON())

    return { bets: jsonBets }
  }
}

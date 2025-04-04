import { Sequelize } from '../../../db/models'
import { BET_RESULT } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class CrashGameGetAllPlacedBetsService
 * @extends {ServiceBase}
 */
export default class CrashGameGetAllPlacedBetsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        CrashGameBet: CrashGameBetModel,
        User: UserModel,
        RankingLevel: RankingLevelModel
      },
      sequelizeTransaction
    } = this.context

    const whereCondition = {
      roundId: this.args.roundId,
      result: { [Sequelize.Op.or]: [null, BET_RESULT.LOST, BET_RESULT.WON] }
    }

    const bets = await CrashGameBetModel.findAll({
      where: whereCondition,
      include: {
        model: UserModel,
        as: 'user',
        include: {
          model: RankingLevelModel,
          as: 'userRank'
        }
      },
      transaction: sequelizeTransaction
    })

    const jsonBets = bets.map(bet => bet?.toJSON())

    return { bets: jsonBets }
  }
}

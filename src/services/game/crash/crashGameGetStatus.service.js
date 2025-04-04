import { Sequelize } from '../../../db/models'
import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'
import CrashGameGetTopWinnersService from './crashGameGetTopWinners.service'

export default class CrashGameGetStatus extends ServiceBase {
  async run () {
    const {
      dbModels: {
        CrashGameRoundDetail: CrashGameRoundDetailModel,
        CrashGameBet: CrashGameBetModel
      },
      sequelizeTransaction
    } = this.context

    const currentRound = await CrashGameRoundDetailModel.findOne({
      where: {
        roundState: {
          [Sequelize.Op.ne]: CRASH_GAME_STATE.STOPPED
        }
      },
      include: {
        model: CrashGameBetModel,
        as: 'bets'
      },
      order: [['id', 'DESC']],
      transaction: sequelizeTransaction
    })

    const previousRounds = await CrashGameRoundDetailModel.findAll({
      where: {
        roundState: CRASH_GAME_STATE.STOPPED
      },
      order: [
        ['id', 'DESC']
      ],
      limit: 50,
      transaction: sequelizeTransaction
    })

    const topWinners = await CrashGameGetTopWinnersService.execute({}, this.context)

    return { previousRounds: previousRounds.map(round => round?.toJSON()), currentRound: currentRound?.toJSON(), topWinners: topWinners.result }
  }
}

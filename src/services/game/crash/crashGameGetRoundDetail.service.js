import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE } from '../../../libs/constants'

/**
 *
 *
 * @export
 * @class CrashGameGetRoundDetailService
 * @extends {ServiceBase}
 */
export default class CrashGameGetRoundDetailService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        CrashGameRoundDetail: CrashGameRoundDetailModel,
        User: UserModel,
        CrashGameBet: CrashGameBetModel
      },
      sequelizeTransaction
    } = this.context

    const roundDetail = await CrashGameRoundDetailModel.findOne({
      where: {
        roundId: this.args.roundId,
        roundState: CRASH_GAME_STATE.STOPPED
      },
      include: [
        {
          model: CrashGameBetModel,
          as: 'bets',
          include: [
            {
              model: UserModel,
              as: 'user',
              attributes: ['firstName']
            }
          ]
        }
      ],
      order: ['id'],
      transaction: sequelizeTransaction
    })

    if (!roundDetail) {
      this.addError('InvalidGameRoundErrorType', `roundId ${this.args.roundId}`)
      return
    }

    return roundDetail?.toJSON() || {}
  }
}

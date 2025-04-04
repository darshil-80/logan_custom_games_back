import { Op } from 'sequelize'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class CrashGameGetTopWinnersService
 * @extends {ServiceBase}
 */
export default class CrashGameGetTopWinnersService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        CrashGameBet: CrashGameBetModel
      },
      sequelizeTransaction
    } = this.context

    const placedBets = await CrashGameBetModel.findAll({
      where: {
        winningAmount: {
          [Op.ne]: '0'
        }
      },
      order: [['winningAmount', 'DESC']],
      limit: 3,
      transaction: sequelizeTransaction
    })

    return placedBets.map(bet => bet?.toJSON()) || []
  }
}

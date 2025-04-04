import { Op } from 'sequelize'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { Sequelize } from '../../../db/models'

/**
 * @export
 * @class GetRollerCoasterBetsService
 * @extends {ServiceBase}
 */
export default class GetRollerCoasterBetsService extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          RollerCoasterGameBet: RollerCoasterGameBetModel,
          User: UserModel,
          RankingLevel: RankingLevelModel
        },
        auth: {
          id: userId
        }
      } = this.context

      const { filterType = 'leaderboard', pageNumber = 1, limit = 20, startDate, endDate, order } = this.args

      const offset = (pageNumber - 1) * limit
      const orderBy = [['createdAt', 'desc']]
      // Filter added because all the transaction shown should be closed be, expect active bets
      const filter = { result: { [Op.ne]: null } }

      if (filterType === 'activeBets') { // Filters for active bets
        filter.userId = userId
        filter.result = null
      } else if (filterType === 'closedBets') { // Filters for closed bets
        filter.userId = userId
      } else {
        orderBy[0] = order ? [order, 'desc'] : ['winningAmount', 'desc']
      }

      if (order === 'roi') {
        orderBy[0] = [[Sequelize.literal('(winning_amount/bet_amount)*100'), 'desc']]
      }

      if (startDate) {
        filter.createdAt = { ...filter.createdAt, [Op.gte]: startDate }
      }
      if (endDate) {
        filter.createdAt = { ...filter.createdAt, [Op.lte]: endDate }
      }

      const bets = await RollerCoasterGameBetModel.findAll({
        attributes: [
          [Sequelize.col('RollerCoasterGameBet.id'), 'id'],
          [Sequelize.col('RollerCoasterGameBet.created_at'), 'createdAt'],
          [Sequelize.col('RollerCoasterGameBet.updated_at'), 'updatedAt'],
          'roundId', 'multiplier', 'isBuy', 'betAmount', 'entryPrice', 'exitPrice', 'bustPrice', 'takeProfitPrice',
          'stopLossPrice', 'winningAmount', 'result', 'currencyId', 'betStatus',
          [Sequelize.literal('((winning_amount - bet_amount)/bet_amount)*100'), 'roi']
        ],
        where: filter,
        include: {
          attributes: ['firstName', 'lastName', 'userName'],
          model: UserModel,
          required: true,
          as: 'user',
          include: {
            attributes: ['rank', 'imageLogo', 'moreDetails'],
            model: RankingLevelModel,
            as: 'userRank'
          }
        },
        order: orderBy,
        limit,
        offset
      })

      return bets || []
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

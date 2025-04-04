import { Op } from 'sequelize'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { Sequelize } from '../../../db/models'

/**
 * @export
 * @class GetCryptoFuturesBetsService
 * @extends {ServiceBase}
 */
export default class GetCryptoFuturesBetsService extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          CryptoFuturesBet: CryptoFuturesBetModel,
          User: UserModel,
          RankingLevel: RankingLevelModel
        },
        auth: {
          id: userId
        }
      } = this.context

      const { filterType = 'leaderboard', pageNumber = 1, limit = 20, startDate, endDate, order, instrumentId } = this.args

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

      if (instrumentId) {
        filter.cryptoFuturesInstrumentId = instrumentId
      }

      const bets = await CryptoFuturesBetModel.findAll({
        attributes: [
          [Sequelize.col('CryptoFuturesBet.id'), 'id'],
          [Sequelize.col('CryptoFuturesBet.created_at'), 'createdAt'],
          [Sequelize.col('CryptoFuturesBet.updated_at'), 'updatedAt'],
          'multiplier', 'isBuy', 'betAmount', 'entryPrice', 'exitPrice', 'bustPrice', 'takeProfitPrice', 'stopLossPrice',
          'winningAmount', 'result', 'cryptoFuturesInstrumentId', 'betStatus',
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

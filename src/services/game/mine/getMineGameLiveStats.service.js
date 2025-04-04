import { BET_RESULT } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import { getPrecision } from '../../../utils/math.utils'
/**
 * @export
 * @class GetMineGameLiveStatsService
 * @extends {ServiceBase}
 */
export default class GetMineGameLiveStatsService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        MineGameBet: MineGameBetModel,
        Currency: CurrencyModel
      },
      sequelizeTransaction,
      sequelize
    } = this.context

    const findCurrency = await CurrencyModel.findOne({
      where: { primary: true }
    })

    const mineGameBets = await MineGameBetModel.findAndCountAll({
      attributes: [
        [sequelize.literal('sum("winning_amount")-sum("bet_amount")'), 'totalProfit'],
        [sequelize.fn('sum', sequelize.col('bet_amount')), 'totalBetAmount']
      ],
      where: {
        currencyId: findCurrency.id,
        result: [BET_RESULT.WON, BET_RESULT.LOST]
      },
      raw: true,
      transaction: sequelizeTransaction
    })

    const mineGameWins = await MineGameBetModel.findAndCountAll({
      attributes: [
        [sequelize.fn('count', sequelize.col('id')), 'totalWins']
      ],
      where: {
        currencyId: findCurrency.id,
        result: [BET_RESULT.WON]
      },
      raw: true,
      transaction: sequelizeTransaction
    })

    const mineGameLost = await MineGameBetModel.findAndCountAll({
      attributes: [
        [sequelize.fn('count', sequelize.col('id')), 'totalLost']
      ],
      where: {
        currencyId: findCurrency.id,
        result: [BET_RESULT.LOST]
      },
      raw: true,
      transaction: sequelizeTransaction
    })

    const statistics = {
      totalProfit: getPrecision(mineGameBets?.rows?.[0]?.totalProfit ?? 0),
      totalWagered: getPrecision(mineGameBets?.rows?.[0]?.totalBetAmount ?? 0),
      totalWins: +(mineGameWins?.rows?.[0]?.totalWins ?? 0),
      totalLost: +(mineGameLost?.rows?.[0]?.totalLost ?? 0)

    }

    return {
      statistics
    }
  }
}

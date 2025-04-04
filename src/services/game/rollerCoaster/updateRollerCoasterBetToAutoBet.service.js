import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class RollerCoasterGamePlaceBetUpdateService
 * @extends {ServiceBase}
 */
export default class RollerCoasterGamePlaceBetUpdateService extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          RollerCoasterGameBet: RollerCoasterGameBetModel
        },
        auth: {
          id: userId
        },
        sequelizeTransaction
      } = this.context

      const { betId, stopLossPrice, takeProfitPrice } = this.args

      const betDetail = await RollerCoasterGameBetModel.findOne({
        where: { id: betId, userId: userId, result: null },
        lock: {
          level: sequelizeTransaction.LOCK.UPDATE,
          of: RollerCoasterGameBetModel
        },
        transaction: sequelizeTransaction
      })

      if (!betDetail) {
        this.addError('NoPlacedBetFoundErrorType', 'no bet found')
        return
      }

      if (parseInt(betDetail.exitPrice) !== 0) {
        this.addError('BetAlreadyCashedOut', 'bet already cashed out')
      }

      betDetail.stopLossPrice = stopLossPrice
      betDetail.takeProfitPrice = takeProfitPrice
      betDetail.save({
        lock: {
          level: sequelizeTransaction.LOCK.UPDATE,
          of: RollerCoasterGameBetModel
        },
        transaction: sequelizeTransaction
      })
      return betDetail
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

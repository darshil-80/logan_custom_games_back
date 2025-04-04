import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class UpdateCryptoFuturesBetToAutoBet
 * @extends {ServiceBase}
 */
export default class UpdateCryptoFuturesBetToAutoBet extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          CryptoFuturesBet: CryptoFuturesBetModel
        },
        auth: {
          id: userId
        },
        sequelizeTransaction
      } = this.context

      const { betId, stopLossPrice, takeProfitPrice } = this.args

      const betDetail = await CryptoFuturesBetModel.findOne({
        where: { id: betId, userId: userId, result: null },
        lock: {
          level: sequelizeTransaction.LOCK.UPDATE,
          of: CryptoFuturesBetModel
        },
        transaction: sequelizeTransaction
      })

      if (!betDetail) {
        this.addError('NoPlacedBetFoundErrorType', 'no bet found')
        return
      }

      if (parseInt(betDetail.exitPrice) !== 0) {
        this.addError('BetAlreadyCashedOut', 'bet already cashed out')
        return
      }

      betDetail.stopLossPrice = stopLossPrice
      betDetail.takeProfitPrice = takeProfitPrice
      await betDetail.save({
        lock: {
          level: sequelizeTransaction.LOCK.UPDATE,
          of: CryptoFuturesBetModel
        },
        transaction: sequelizeTransaction
      })
      return betDetail
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

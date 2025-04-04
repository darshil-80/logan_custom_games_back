import ServiceBase from '../../libs/serviceBase'

export default class GetTotalWinningAmountService extends ServiceBase {
  async run () {
    const {
      dbModels: { CrashGameBet: CrashGameBetModel },
      sequelizeTransaction
    } = this.context
    try {
      const totalWinningAmount = await CrashGameBetModel.sum('betAmount', {
        transaction: sequelizeTransaction
      })

      if (!totalWinningAmount) {
        return this.addError('RecordNotFoundErrorType', 'Record Not Found')
      }

      return { totalWinningAmount: totalWinningAmount }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

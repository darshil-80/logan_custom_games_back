import ServiceBase from '../../libs/serviceBase'

export default class GetTotalBetsService extends ServiceBase {
  async run () {
    const {
      dbModels: { CrashGameBet: CrashGameBetModel },
      sequelizeTransaction
    } = this.context
    try {
      const totalBets = await CrashGameBetModel.count({
        transaction: sequelizeTransaction
      })

      if (!totalBets) {
        return this.addError('RecordNotFoundErrorType', 'Record Not Found')
      }

      return { totalBets: totalBets }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

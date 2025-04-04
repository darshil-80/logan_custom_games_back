import ServiceBase from '../../libs/serviceBase'

export default class GetGameDetailsService extends ServiceBase {
  async run () {
    const {
      dbModels: { Game: GameModel }
    } = this.context
    try {
      const gameDetails = await GameModel.findAll()

      if (!gameDetails.length) {
        return this.addError('RecordNotFoundErrorType', 'Record Not Found')
      }

      return gameDetails.map(gameDetail => gameDetail?.toJSON()) || []
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

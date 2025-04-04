import inMemoryDB from '../../libs/inMemoryDb'
import ServiceBase from '../../libs/serviceBase'

export default class GetGameSettingsService extends ServiceBase {
  async run () {
    try {
      console.log("-----------");
      const gameSettings = inMemoryDB.getAll('gameSettings')
      if (!gameSettings.length) {
        return this.addError('RecordNotFoundErrorType', 'Record Not Found')
      }

      return gameSettings || []
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

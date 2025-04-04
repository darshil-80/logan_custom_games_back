import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class GetRollerCoasterBetsService
 * @extends {ServiceBase}
 */
export default class GetRollerCoasterBetDetailService extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          RollerCoasterGameBet: RollerCoasterGameBetModel
        }
      } = this.context

      const { betId } = this.args

      const betDetail = await RollerCoasterGameBetModel.findOne({ where: { id: +betId } })

      if (!betDetail) {
        this.addError('NoPlacedBetFoundErrorType', 'no bet found')
        return
      }

      return betDetail
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

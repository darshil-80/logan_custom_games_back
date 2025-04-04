import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show all bonuses details
 * @export
 * @class GetAllBonuses
 * @extends {ServiceBase}
 */
export default class GetAllBonusesService extends ServiceBase {
  async run () {
    const {
      dbModels: { Bonus: BonusModel },
      sequelizeTransaction
    } = this.context

    try {
      const bonuses = await BonusModel.findAll({
        where: { active: true },
        transaction: sequelizeTransaction
      })

      return {
        bonuses: bonuses.map(bonus => bonus?.toJSON()) || []
      }
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show all rank details
 * @export
 * @class GetAllRankDetails
 * @extends {ServiceBase}
 */
export default class GetAllRankDetailsService extends ServiceBase {
  async run () {
    const {
      dbModels: { RankingLevel: RankingLevelModel },
      sequelizeTransaction
    } = this.context

    try {
      const rankDetails = await RankingLevelModel.findAll({
        order: [['id', 'ASC']],
        transaction: sequelizeTransaction
      })

      return {
        rankDetails: rankDetails.map(bonus => bonus?.toJSON()) || []
      }
    } catch (error) {
      console.log(error)
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

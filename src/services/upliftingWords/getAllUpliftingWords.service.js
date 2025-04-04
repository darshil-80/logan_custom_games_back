import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show all uplifting words
 * @export
 * @class GetAllUpliftingWordsService
 * @extends {ServiceBase}
 */
export default class GetAllUpliftingWordsService extends ServiceBase {
  async run () {
    const {
      dbModels: { UpliftingWord: UpliftingWordModel }
    } = this.context

    try {
      const words = await UpliftingWordModel.findAll({
        where: { status: true },
        order: [['multipliers', 'ASC']]
      })

      return {
        words: words.map(word => word?.toJSON()) || []
      }
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

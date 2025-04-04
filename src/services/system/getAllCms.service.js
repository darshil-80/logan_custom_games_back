import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show all cms details
 * @export
 * @class GetAllCmsService
 * @extends {ServiceBase}
 */
export default class GetAllCmsService extends ServiceBase {
  async run () {
    const {
      dbModels: { Cms: CmsModel }
    } = this.context

    try {
      const allCms = await CmsModel.findAll({
        where: { active: true }
      })

      return {
        cms: allCms.map(cms => cms?.toJSON()) || []
      }
    } catch (error) {
      return this.addError('RecordNotFoundErrorType', 'Record Not Found')
    }
  }
}

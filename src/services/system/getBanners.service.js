import ServiceBase from '../../libs/serviceBase'

export default class GetBannersService extends ServiceBase {
  async run () {
    const {
      dbModels: { Banner: BannerModel },
      sequelizeTransaction
    } = this.context
    try {
      const banners = await BannerModel.findAll({
        transaction: sequelizeTransaction
      })

      if (!banners.length) {
        return this.addError('RecordNotFoundErrorType', 'Record Not Found')
      }

      return banners.map(banner => banner?.toJSON()) || []
    } catch (e) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

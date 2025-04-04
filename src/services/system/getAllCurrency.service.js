import ServiceBase from '../../libs/serviceBase'

export default class GetAllCurrencyService extends ServiceBase {
  async run () {
    const {
      dbModels: { Currency: CurrencyModel }
    } = this.context
    try {
      const currencies = await CurrencyModel.findAll()

      if (!currencies.length) {
        return this.addError('RecordNotFoundErrorType', 'Record Not Found')
      }

      return currencies.map(currency => currency?.toJSON()) || []
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', 'Something Went Wrong')
    }
  }
}

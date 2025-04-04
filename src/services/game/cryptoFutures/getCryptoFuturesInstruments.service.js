import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class GetCryptoFuturesGameInstruments
 * @extends {ServiceBase}
 */
export default class GetCryptoFuturesGameInstruments extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          CryptoFuturesInstrument: CryptoFuturesInstrumentModel
        }
      } = this.context

      const instruments = await CryptoFuturesInstrumentModel.findAll({
        where: { isEnabled: true },
        order: [['sortOrder', 'asc']]
      })

      return instruments
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

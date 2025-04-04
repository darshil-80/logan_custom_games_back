
import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    customGameId: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to remove custom favourite game
 * @class RemoveFavoriteGameService
 * @extends {ServiceBase}
 */
export default class RemoveCustomFavoriteGameService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { CustomFavouriteGame: CustomFavouriteGameModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context
    const { customGameId } = this.args

    const checkFavoriteGameExists = await CustomFavouriteGameModel.findOne({
      where: { userId, customGameId },
      attributes: ['id'],
      transaction: sequelizeTransaction
    })

    if (!checkFavoriteGameExists) return this.addError('FavoriteGameNotFoundErrorType')

    await CustomFavouriteGameModel.destroy({
      where: { userId, customGameId },
      transaction: sequelizeTransaction
    })
    return {
      message: 'Favourite Game Removed Sucessfully'
    }
  }
}

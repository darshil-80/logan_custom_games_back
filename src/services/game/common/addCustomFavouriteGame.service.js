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
 * Provides service to add custom favourite game
 * @class AddFavoriteGameService
 * @extends {ServiceBase}
 */
export default class AddCustomFavoriteGameService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        CustomFavouriteGame: CustomFavouriteGameModel,
        Game: GameModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context
    const { customGameId } = this.args

    const checkCustomGameExists = await GameModel.findOne({
      where: { id: customGameId },
      transaction: sequelizeTransaction
    })

    if (!checkCustomGameExists) return { message: 'Game Not Found' }

    const checkFavoriteGameExists = await CustomFavouriteGameModel.findOne({
      where: { userId, customGameId },
      attributes: ['id'],
      transaction: sequelizeTransaction
    })

    if (checkFavoriteGameExists) return this.addError('FavoriteGameExistsErrorType')

    await CustomFavouriteGameModel.create(
      {
        userId,
        customGameId
      },
      {
        transaction: sequelizeTransaction
      })
    return { success: true, message: 'Game Added successfully' }
  }
}

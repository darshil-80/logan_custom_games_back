import ServiceBase from '../../../libs/serviceBase'

/**
 * Provides service to get all favourite games
 * @class GetCustomFavoriteGameService
 * @extends {ServiceBase}
 */
export default class GetCustomFavoriteGameService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        CustomFavouriteGame: CustomFavouriteGameModel,
        Game: GameModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context
    let gameQuery

    const favouriteGames = await CustomFavouriteGameModel.findAndCountAll({
      where: { userId },
      include: [{
        model: GameModel,
        where: gameQuery,
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      }],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      transaction: sequelizeTransaction
    })

    if (!favouriteGames) {
      return this.addError('FavoriteGamesNotFoundErrorType')
    }
    return favouriteGames
  }
}

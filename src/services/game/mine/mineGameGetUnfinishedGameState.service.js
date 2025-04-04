import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class MineGameGetUnfinishedGameStateService
 * @extends {ServiceBase}
 */
export default class MineGameGetUnfinishedGameStateService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        User: UserModel,
        MineGameBet: MineGameBetModel,
        MineGamePlayState: MineGamePlayStateModel
      },
      auth: {
        id: userId
      },
      sequelizeTransaction
    } = this.context

    // Fetching user details
    const user = await UserModel.findOne({
      where: {
        id: userId
      },
      transaction: sequelizeTransaction
    })

    // Validations
    if (!user) {
      this.addError('UserNotExistsErrorType', `no user found ${userId}`)
      return
    }

    // to check previous round is completed or not
    const unfinishedGameBetDetails = await MineGameBetModel.findOne({
      attributes: {
        exclude: ['mineTiles', 'serverSeed', 'winningAmount']
      },
      where: {
        userId,
        result: null
      },
      include: [{
        model: MineGamePlayStateModel,
        as: 'playStates',
        attributes: ['tile']
      }],
      order: [[{ model: MineGamePlayStateModel, as: 'playStates' }, 'id', 'ASC']],
      transaction: sequelizeTransaction
    })

    if (!unfinishedGameBetDetails) {
      return { hasUnfinishedGame: false }
    }

    return {
      hasUnfinishedGame: true,
      unfinishedGameBetDetails
    }
  }
}

import inMemoryDB from '../../../libs/inMemoryDb'
import ServiceBase from '../../../libs/serviceBase'

/**
 * @export
 * @class MineGameGetUnfinishedGameStateService
 * @extends {ServiceBase}
 */
export default class MineGameGetUnfinishedGameStateService extends ServiceBase {
  async run () {
    // Fetching user details
    const { userId } = this.args;

    const user = inMemoryDB.get('users', userId)

    // Validations
    if (!user) {
      this.addError('UserNotExistsErrorType', `no user found ${userId}`)
      return
    }

    // to check previous round is completed or not
    const unfinishedGameBetDetails = inMemoryDB.get('mineGameBets', userId)

    if (!unfinishedGameBetDetails || unfinishedGameBetDetails.result !== null) {
      return { hasUnfinishedGame: false }
    }

    const unfinishedGameBet = {...unfinishedGameBetDetails}
    delete unfinishedGameBet.mineTiles
    delete unfinishedGameBet.serverSeed
    delete unfinishedGameBet.winningAmount

    unfinishedGameBet.playStates = unfinishedGameBet.playStates.map(playerState => {return {tile: playerState?.tile}})

    return {
      hasUnfinishedGame: true,
      unfinishedGameBetDetails: unfinishedGameBet
    }
  }
}

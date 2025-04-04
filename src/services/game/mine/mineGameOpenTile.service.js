import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { BET_RESULT, MAX_TILE_COUNT, MIN_TILE_COUNT } from '../../../libs/constants'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class MineGameOpenTileService
 * @extends {ServiceBase}
 */
export default class MineGameOpenTileService extends ServiceBase {
  async run () {
    let { tile, userId } = this.args
    tile = parseInt(tile)

    if (tile < MIN_TILE_COUNT || tile > MAX_TILE_COUNT) {
      this.addError('InvalidTileErrorType')
      return
    }

    // Fetching user details
    const user = inMemoryDB.get('users', userId)

    // Validations
    if (!user) {
      this.addError('UserNotExistsErrorType')
      return
    }

    const mineGameBet = inMemoryDB.get('mineGameBets', userId)

    if (!mineGameBet) {
      this.addError('NoPlacedBetFoundErrorType')
      return
    }

    // Check playing state
    const tileAlreadyOpen = mineGameBet.playStates.find(playerState => playerState.tile === tile)

    if (tileAlreadyOpen) {
      this.addError('MineTileAlreadyOpenedErrorType')
      return
    }

    mineGameBet.playStates.push({
      betId: mineGameBet.id,
      tile
    })
    
    if (!mineGameBet.mineTiles.includes(tile)) {
      return {
        mineTile: false
      }
    }

    try {
      mineGameBet.result = BET_RESULT.LOST

      inMemoryDB.set('mineGameBets', userId, mineGameBet)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      return { mineTile: true, ...mineGameBet, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

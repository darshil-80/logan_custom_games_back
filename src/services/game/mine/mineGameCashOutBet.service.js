import { plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { calculateMineGameOdd } from '../../../utils/game.utils'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import {
  BET_RESULT,
  MAX_TILE_COUNT
} from '../../../libs/constants'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import inMemoryDB from '../../../libs/inMemoryDb'
/**
 *
 *
 * @export
 * @class MineGameCashOutBetService
 * @extends {ServiceBase}
 */

export default class MineGameCashOutBetService extends ServiceBase {
  async run () {
    const{ userId } = this.args
    // Fetching user details
    const user = await inMemoryDB.get('users', userId)

    // Validations
    if (!user) {
      this.addError('UserNotExistsErrorType')
      return
    }

    const mineGameBet = await inMemoryDB.get('mineGameBets', userId)

    if (!mineGameBet) {
      this.addError('NoPlacedBetFoundErrorType')
      return
    }

    // Check playing state
    const openedTileCount = mineGameBet.playStates.length

    if (openedTileCount === 0) {
      this.addError('NoOpenedTileFoundErrorType')
      return
    }

    const gameSettings = await inMemoryDB.get('gameSettings', 3)

    try {
      const odds = calculateMineGameOdd({ mineGameBet, openedTileCount, gameSettings, MAX_TILE_COUNT })

      mineGameBet.result = BET_RESULT.WON
      mineGameBet.winningAmount = times(odds, mineGameBet.betAmount)

      await inMemoryDB.set('mineGameBets', userId, mineGameBet)

      const userWallet = user.wallet
      userWallet.amount = plus(userWallet.amount, mineGameBet.winningAmount)
      await inMemoryDB.set('users', userId, user)

      WalletEmitter.emitUserWalletBalance({
        "amount": userWallet.amount,
        "primary": true,
        "currencyId": "2",
        "ownerType": "USER",
        "ownerId": userWallet.ownerId,
        "nonCashAmount": 0,
        "bonusBalance": 10,
        "walletAddress": null,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "currency": {
          "id": "2",
          "code": "USD"
        }
      }, userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      return { ...mineGameBet, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

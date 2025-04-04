import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import MineGamePlaceBetService from './mineGamePlaceBet.service'
import MineGameOpenTileService from './mineGameOpenTile.service'
import MineGameCashOutBetService from './mineGameCashOutBet.service'
import { BET_RESULT, MAX_TILE_COUNT, MIN_TILE_COUNT } from '../../../libs/constants'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { plus } from 'number-precision'
import BaseError from '../../../errors/base.error'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class MineGamePlaceAutoBetService
 * @extends {ServiceBase}
 */
export default class MineGamePlaceAutoBetService extends ServiceBase {
  async run () {
    const { mineCount, betAmount, clientSeed, tiles, currencyId, userId } = this.args
    let placedBet

    try {
      try {
        placedBet = await MineGamePlaceBetService.run({
          mineCount,
          currencyId,
          betAmount,
          clientSeed,
          userId
        }, {
          ...this.context,
        })
      } catch (error) {
        throw new BaseError({ name: 'Internal', description: error.message })
      }

      let openTile = {}

      try {
        for (let index = 0; index < tiles.length; index++) {
          openTile = await MineGameOpenTileService.run({
            tile: tiles[index],
            userId
          }, this.context)

          if (openTile.mineTile) {
            return openTile
          }
        }
      } catch (error) {
        throw new BaseError({ name: 'Internal', description: error.message })
      }

      let cashedOutBet
      try {
        cashedOutBet = await MineGameCashOutBetService.run({ userId }, this.context)
      } catch (error) {
        throw new BaseError({ name: 'Internal', description: error.message })
      }

      return cashedOutBet
    } catch (error) {
      if (placedBet) {
        const user = inMemoryDB.get('users', userId)

        const alreadyPlacedBet = inMemoryDB.get('mineGameBets', userId)

        if (!alreadyPlacedBet || alreadyPlacedBet.result !== null) {
          this.addError('NoPlacedBetFoundErrorType', 'no bet found')
          return
        }

        const userWallet = user.wallet

        const betAmount = alreadyPlacedBet.betAmount

        alreadyPlacedBet.result = BET_RESULT.CANCELLED

        userWallet.amount = plus(userWallet.amount, betAmount)
        inMemoryDB.set('users', userId, user)

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

        alreadyPlacedBet.result = BET_RESULT.CANCELLED

        inMemoryDB.set('mineGameBets', userId, alreadyPlacedBet)

      }
      this.addError('MineGameAutoBetNotCompletedErrorType')
    }
  }
}

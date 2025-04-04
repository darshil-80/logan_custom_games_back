import { minus } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { getCachedData } from '../../../helpers/redis.helpers'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import MineGameGenerateResultService from './mineGameGenerateResult.service'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { MAX_MINE_COUNT, MIN_MINE_COUNT } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import { v4 as uuidv4 } from 'uuid';

/**
 *
 *
 * @export
 * @class MineGamePlaceBetService
 * @extends {ServiceBase}
 */

export default class MineGamePlaceBetService extends ServiceBase {
  
  async run () {
    const { mineCount, betAmount, clientSeed, currencyId, userId } = this.args
    if (mineCount < MIN_MINE_COUNT || mineCount > MAX_MINE_COUNT) {
      this.addError('InvalidMineCountErrorType')
      return
    }

    // Fetching user details
    let user = inMemoryDB.get('users', userId)
    // add user if not exists
    if (!user) {
      this.addError('UserNotExistsErrorType')
      return
    }

    const userWallet = user.wallet
    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    if (betAmount < 1 || betAmount > 20) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) {
      this.addError('ServerSeedNotFoundErrorType')
    }

    const mineGameResult = await MineGameGenerateResultService.run({ serverSeed, clientSeed, mineCount })

    const winningAmount = 0
    const betResult = null

    // create debit transaction

    try {
      inMemoryDB.set('mineGameBets', userId, {
        id: uuidv4(),
        userId: userId,
        mineCount,
        mineTiles: mineGameResult,
        betAmount,
        currencyId,
        winningAmount,
        clientSeed: clientSeed,
        serverSeed,
        result: betResult,
        currentGameSettings: {
          minOdd: 1,
          maxOdd: 20,
          houseEdge: 4
        }
      })
      userWallet.amount = minus(userWallet.amount, betAmount)

      // Save the updated wallet back to in-memory DB
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
      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)
      return {
          "userId": userId,
          "mineCount": 3,
          "betAmount": betAmount,
          "currencyId": "2",
          "clientSeed": "9TLMRle6kaNhSMAKFiv1mDzU2XH9Ne0J",
          "updatedAt": new Date(),
          "createdAt": new Date(),
          nextServerSeedHash,
      }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

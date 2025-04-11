import APIError from '../../../errors/api.error'
import { minus } from 'number-precision'
import ServiceBase from '../../../libs/serviceBase'
import { getCachedData } from '../../../helpers/redis.helpers'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import inMemoryDB from '../../../libs/inMemoryDb'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_GAME_ID } from '../../../libs/constants'
import GameSettingsService from '../common/gameSettings.service'

/**
 *
 *
 * @export
 * @class HiLoGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class HiLoGamePlaceBetService extends ServiceBase {
  async run () {
    const { initialCard, betAmount, clientSeed, currencyId, userId } = this.args

    // Fetching user details
    const user = await inMemoryDB.get('users', userId);

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    // const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary)[0] : null
    const userWallet = user.wallet

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    // INFO: Prevent bet if a bet is already open
    const previousOpenBet = await inMemoryDB.get('hiloGameBets', userId)

    if (previousOpenBet && previousOpenBet.result === null) return this.addError('PreviousOpenBetExistErrorType')

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.HILO }, this.context)).result

    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      return this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) this.addError('ServerSeedNotFoundErrorType')

    const { minOdd, maxOdd, houseEdge } = gameSettings

    try {
      const hiLoGameBet = {
        id: uuidv4(),
        userId: userId,
        initialCard,
        betAmount,
        currencyId,
        clientSeed: clientSeed,
        serverSeed,
        result: null,
        currentGameSettings: JSON.stringify({ minOdd, maxOdd, houseEdge }),
        betStates: []
      }

      await inMemoryDB.set('hiloGameBets', userId, hiLoGameBet)

      // Updating user wallet
      userWallet.amount = minus(userWallet.amount, betAmount)
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
        },
      }, userWallet.ownerId)

      await inMemoryDB.set('users', userId, user);

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      hiLoGameBet.nextServerSeedHash = nextServerSeedHash

      return { ...hiLoGameBet, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

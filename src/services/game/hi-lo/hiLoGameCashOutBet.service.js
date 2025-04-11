import Flatted from 'flatted'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { times, minus, plus } from 'number-precision'
import { calculateOdds } from '../../../utils/math.utils'
import GameSettingsService from '../common/gameSettings.service'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import HiLoGameCalculateOddsForBet from './hiloGameCalculateOddsForBet.service'
import {
  DEFAULT_GAME_ID, BET_RESULT  // PAYMENT_METHODS
} from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class HiLoGameCashOutBetService
 * @extends {ServiceBase}
 */
export default class HiLoGameCashOutBetService extends ServiceBase {
  async run () {
    const { userId } = this.args

    // Fetching user details
    const user = await inMemoryDB.get('users', userId);

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    // const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary)[0] : null
    const userWallet = user.wallet;

    const hiLoGameBet = await inMemoryDB.get("hiloGameBets", userId);

    if (!hiLoGameBet || hiLoGameBet.result !== null) {
      this.addError('NoPlacedBetFoundErrorType', `no user found ${userId}`)
      return
    }

    if (this.args.result === BET_RESULT.LOST) {
      hiLoGameBet.winningAmount = 0
      hiLoGameBet.result = BET_RESULT.LOST
    } else {
      hiLoGameBet.result = BET_RESULT.WON
      const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.HILO }, this.context)).result

      const maxProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

      let odds = await HiLoGameCalculateOddsForBet.run({ bet: Flatted.parse(Flatted.stringify(hiLoGameBet)) }, this.context)

      odds = calculateOdds(gameSettings, odds)

      let winningAmount = times(hiLoGameBet.betAmount, odds)

      const profit = minus(winningAmount, hiLoGameBet.betAmount)

      if (profit > maxProfit) {
        winningAmount = plus(hiLoGameBet.betAmount, maxProfit.amount)
      }

      hiLoGameBet.winningAmount = winningAmount
    }

    try {
      userWallet.amount = plus(userWallet.amount, hiLoGameBet.winningAmount)

      await inMemoryDB.set('hiloGameBets', userId, hiLoGameBet);
      await inMemoryDB.set('users', userId, user);

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

      const nextServerSeedHash = await generateServerSeedHash(userId)

      hiLoGameBet.nextServerSeedHash = nextServerSeedHash

      return hiLoGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

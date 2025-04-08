import { minus, plus, times } from 'number-precision'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { BET_RESULT, DEFAULT_GAME_ID } from '../../../libs/constants'
import GameSettingsService from '../common/gameSettings.service'
import GetMultiplierByCrashGameGraphTimeService from './getMultiplierByCrashGameGraphTime.service'
import inMemoryDB from '../../../libs/inMemoryDb'

/**
 *
 *
 * @export
 * @class AutoPlayerEscapeCrashGameService
 * @extends {ServiceBase}
 */
export default class AutoPlayerEscapeCrashGameService extends ServiceBase {
  async run () {
    try {
      const time = +(this.args.secondTenths / 10).toFixed(1)
      const multiplier = await GetMultiplierByCrashGameGraphTimeService.run({ time }, this.context)

      const crashGameRound = await inMemoryDB.findByField('crashGameRounddetails', 'roundId', this.args.roundId)

      if (!crashGameRound || +crashGameRound.crashRate <= +multiplier) {
        return { escaped: 0 }
      }

      const bets = await inMemoryDB.findAllByField('crashGameBets', 'roundId', this.args.roundId)
      
      const crashGameBets = bets.filter(bet => {
        if(
          bet.escapeRate <= 1 &&
          bet.autoRate <= multiplier &&
          [null, BET_RESULT.LOST].includes(bet.result)
        ) {
          return bet
        }
      })


      const gameSettings = await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.CRASH }, this.context)

      const promises = crashGameBets.map(async (crashGameBet) => {
        try {
          if (+crashGameBet.autoRate <= +multiplier) {
            const user = await inMemoryDB.get('users', crashGameBet.userId);

            const userWallet = user.wallet

            crashGameBet.result = BET_RESULT.WON
            crashGameBet.escapeRate = crashGameBet.autoRate
            crashGameBet.winningAmount = times(crashGameBet.autoRate, crashGameBet.betAmount)

            const currencyCode = userWallet.currency.code
            const maxProfit = gameSettings.result.maxProfit.filter(gameSetting => gameSetting.coinName === currencyCode)[0]
            const profit = minus(crashGameBet.winningAmount, crashGameBet.betAmount)

            if (profit > maxProfit.amount) {
              crashGameBet.winningAmount = plus(crashGameBet.betAmount, maxProfit.amount)
            }

            userWallet.amount = plus(userWallet.amount, crashGameBet.winningAmount)

            await inMemoryDB.set('crashGameBets', crashGameBet.userId, crashGameBet);
            await inMemoryDB.set('users', crashGameBet.userId, user);

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
          }
        } catch (err) {
          console.log(err)
          throw err
        }

        return crashGameBet
      })

      await Promise.all(promises)

      return { escaped: promises.length }
    } catch (error) {
      this.log.error('Critical Error', { exception: error, context: this.context })
      throw error
    }
  }
}

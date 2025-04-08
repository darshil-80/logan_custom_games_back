import { minus, plus, times } from 'number-precision'
import { DEFAULT_GAME_ID, BET_RESULT } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import GameSettingsService from '../common/gameSettings.service'
import inMemoryDB from '../../../libs/inMemoryDb'

// const constraints = {
//   roundId: {
//     type: 'string'
//   },
//   secondTenths: {
//     type: 'number'
//   }
// }

/**
 *
 *
 * @export
 * @class ResolveAllCrashBetsService
 * @extends {ServiceBase}
 */
export default class ResolveAllCrashBetsService extends ServiceBase {
  // get constraints() {
  //   return constraints
  // }

  async run () {
    try {
      const crashGameRound = await inMemoryDB.findByField('crashGameRounddetails', 'roundId', this.args.roundId)

      const bets = await inMemoryDB.findAllByField('crashGameBets', 'roundId', this.args.roundId)

      const crashGameBets = bets.filter(bet => {
        if(bet.escapeRate <= 1 && bet.result === null) {
          return bet;
        }
      })

      if (!crashGameRound) {
        return { bets: 0 }
      }

      const gameSettings = await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.CRASH }, this.context)

      const promises = crashGameBets?.map(async (crashGameBet) => {
        const user = await inMemoryDB.get('users', crashGameBet.userId);

        const userWallet = user.wallet
        
        try {
          if (+crashGameRound.crashRate >= +crashGameBet.autoRate) {
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
          } else {
            crashGameBet.result = BET_RESULT.LOST
          }

          await inMemoryDB.set('crashGameBets', crashGameBet.userId, crashGameBet);
          await inMemoryDB.set('users', crashGameBet.userId, user);

        } catch (err) {
          console.log(err);
          throw err
        }

        return crashGameBet
      })

      await Promise.all(promises || [])

      // await sequelizeTransaction?.commit()

      return { bets: promises.length }
    } catch (error) {
      this.log.error('Critical Error', { exception: error, context: this.context })
      throw error
    }
  }
}

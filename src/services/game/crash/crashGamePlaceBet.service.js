import { minus } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { CRASH_GAME_STATE, DEFAULT_GAME_ID } from '../../../libs/constants'
import inMemoryDB from '../../../libs/inMemoryDb'
import GameSettingsService from '../common/gameSettings.service'
/**
 *
 *
 * @export
 * @class CrashGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class CrashGamePlaceBetService extends ServiceBase {
  async run () {
    const { autoRate, betAmount, currencyId, userId } = this.args

    // Fetching user details
    const user = await inMemoryDB.get('users', userId)

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    const userWallet = user.wallet

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.CRASH }, this.context)).result

    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (autoRate < gameSettings.minAutoRate && autoRate >= gameSettings.maxOdd) {
      this.addError('AutoRateIsInvalidErrorType', `autoRate ${autoRate}`)
      return
    }

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }
    const currentRounds = await inMemoryDB.findAllByField('crashGameRounddetails', 'roundState', CRASH_GAME_STATE.STARTED)
    
    const currentRound = currentRounds[currentRounds.length - 1];

    if (!currentRound) {
      this.addError('NoRoundRunningErrorType', 'no round is running')
      return
    }

    const PlacedBets = await inMemoryDB.findAllByField('crashGameBets', 'roundId', currentRound.roundId)
    const alreadyPlacedBets = PlacedBets.filter(bet => {
      if(bet.userId === userId && bet.result === null) {
        return bet
      }
    });

    if (alreadyPlacedBets && alreadyPlacedBets.length) {
      return alreadyPlacedBets[0]
    }

    // create debit transaction

    try {
      await inMemoryDB.set('crashGameBets', userId, {
        escapeRate: 0,
        // id: '21',
        roundId: currentRound.roundId,
        userId: userId,
        autoRate,
        betAmount,
        currencyId,
        updatedAt: new Date(),
        createdAt: new Date(),
        winningAmount: 0,
        gameId: null,
        result: null
      })

      const crashGameBet = await inMemoryDB.get('crashGameBets', userId)

      // Updating user wallet
      userWallet.amount = minus(userWallet.amount, betAmount)

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
      return crashGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

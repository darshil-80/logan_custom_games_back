import { minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import { getCachedData } from '../../../helpers/redis.helpers'
import { DEFAULT_GAME_ID, BET_RESULT } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { countOnes } from '../../../utils/math.utils'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import GameSettingsService from '../common/gameSettings.service'
import PlinkoGameGenerateResultService from './plinkoGameGenerateResult.service'
import PlinkoGameLightningBoardDetails from './plinkoGameLightningBoardDetails.service'
import { getResultingBetMultiplierByBallTrajectory } from '../../../utils/game.utils'
import inMemoryDB from '../../../libs/inMemoryDb'
import { v4 as uuidv4 } from 'uuid'

const FIXED_ODDS = {
  8: [[5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6], [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13], [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29]],
  9: [[5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6], [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18], [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43]],
  10: [[8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9], [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22], [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76]],
  11: [[8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4], [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24], [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120]],
  12: [[10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10], [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33], [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170]],
  13: [[8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1], [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43], [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260]],
  14: [[7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1], [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58], [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420]],
  15: [[15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15], [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88], [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620]],
  16: [[16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16], [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110], [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]]
}

/**
 *
 *
 * @export
 * @class PlinkoGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class PlinkoGamePlaceBetService extends ServiceBase {
  async run () {
    const { riskLevel, numberOfRows, betAmount, clientSeed, isLightningMode, currencyId, demo, userId } = this.args

    const { lightningBoardDetails } = await PlinkoGameLightningBoardDetails.run({}, this.context)

    // Fetching user details
    const user = await inMemoryDB.get('users', userId)

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    const userWallet = user.wallet
    
    if (userWallet.amount < +betAmount && userWallet.nonCashAmount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.PLINKO }, this.context)).result
    
    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `betAmount ${betAmount}`)
      return
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) {
      this.addError('ServerSeedNotFoundErrorType')
    }

    const plinkoGameResult = await PlinkoGameGenerateResultService.run({ serverSeed, clientSeed, numberOfRows })

    const resultingMultiplier = getResultingBetMultiplierByBallTrajectory(lightningBoardDetails.betMultipliers, plinkoGameResult)

    let winningAmount = 0
    let betResult = BET_RESULT.LOST
    const ones = countOnes(plinkoGameResult)

    // Demo Formula logic for probability generation
    // const probability = combination(numberOfRows, ones) * (0.5 ** numberOfRows)

    if (isLightningMode) {
      const odds = lightningBoardDetails.payouts?.[ones]
      const netMultiplier = times(odds, resultingMultiplier)
      betResult = netMultiplier >= 1 ? BET_RESULT.WON : BET_RESULT.LOST
      winningAmount = times(betAmount, netMultiplier)
      const profit = minus(winningAmount, betAmount)

      if (profit > +maxBetProfit.amount) {
        winningAmount = plus(betAmount, maxBetProfit.amount)
      }
    } else {
      const odds = FIXED_ODDS[numberOfRows][(riskLevel - 1)][ones]
      betResult = odds >= 1 ? BET_RESULT.WON : BET_RESULT.LOST
      winningAmount = times(betAmount, odds)
      const profit = minus(winningAmount, betAmount)

      if (profit > +maxBetProfit.amount) {
        winningAmount = plus(betAmount, maxBetProfit.amount)
      }
    }

    const { minOdd, maxOdd, houseEdge } = gameSettings

    try {
      const plinkoGameBet = {
        id: uuidv4(),
        userId: userId,
        numberOfRows,
        riskLevel,
        dropDetails: plinkoGameResult,
        winningSlot: ones,
        betAmount,
        currencyId,
        winningAmount,
        clientSeed: clientSeed,
        serverSeed,
        result: betResult,
        currentGameSettings: JSON.stringify({ minOdd, maxOdd, houseEdge })
      }

      await inMemoryDB.set('plinkoGameBets', userId, plinkoGameBet)

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
        type: 'debit', 
        betInfo: plinkoGameBet
      }, userWallet.ownerId)

      if (winningAmount !== 0) {
        userWallet.amount = plus(userWallet.amount, winningAmount)
      }
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
        },
        type: 'credit', 
        betInfo: plinkoGameBet 
      }, userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      return { ...plinkoGameBet, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

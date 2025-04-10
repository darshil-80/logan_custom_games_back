import { minus, plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import { getCachedData } from '../../../helpers/redis.helpers'
import { BET_RESULT, DEFAULT_GAME_ID } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { calculateOdds, countOnes, getCoinOutcomeProbability } from '../../../utils/math.utils'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import GameSettingsService from '../common/gameSettings.service'
import FlipCoinGameGenerateResultService from './flipCoinGameGenerateResult.service'
import inMemoryDB from '../../../libs/inMemoryDb'
import { v4 as uuidv4 } from 'uuid'
/**
 *
 *
 * @export
 * @class FlipCoinGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class FlipCoinGamePlaceBetService extends ServiceBase {
  async run () {
    const { currencyId, numberOfCoins, heads, betAmount, clientSeed, minimumChosenOutcome, demo, userId } = this.args

    // if (demo) {
    //   let { demoAmount } = this.args
    //   if (!demoAmount) demoAmount = 3000
    //   if (+betAmount > +demoAmount) return this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${demoAmount} betAmount ${betAmount}`)
    //   // Roll Dice
    //   const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.FLIP_COIN }, this.context))

    //   const _serverSeed = Math.random().toString(36).substring(2, 12)
    //   const flipCoinGameResult = await FlipCoinGameGenerateResultService.run({ serverSeed: _serverSeed, clientSeed, numberOfCoins })
    //   const ones = countOnes(flipCoinGameResult)
    //   const favorable = heads ? ones : (numberOfCoins - ones)

    //   let winningAmount = 0
    //   let betResult = BET_RESULT.LOST

    //   const probability = getCoinOutcomeProbability(numberOfCoins, minimumChosenOutcome)

    //   if (favorable >= minimumChosenOutcome) {
    //     const odds = calculateOdds(gameSettings, 1 / probability)
    //     betResult = BET_RESULT.WON
    //     winningAmount = times(betAmount, odds)
    //   }

    //   let balance = minus(demoAmount, betAmount)

    //   if (betResult === BET_RESULT.WON) {
    //     balance = plus(balance, winningAmount)
    //   }

    //   return {
    //     id: uuid(),
    //     outcome: flipCoinGameResult,
    //     betAmount: betAmount,
    //     currencyId,
    //     winningAmount: winningAmount,
    //     clientSeed: clientSeed,
    //     serverSeed: _serverSeed,
    //     result: betResult,
    //     demo: true,
    //     demoAmount: balance,
    //     minimumChosenOutcome,
    //     numberOfCoins
    //   }
    // }

    // numberOfCoins validation
    if (numberOfCoins < 1 || numberOfCoins > 10) {
      this.addError('InvalidNumberOfCoins')
      return
    }

    // minimumChosenOutcome Validation
    if (minimumChosenOutcome < 1 || minimumChosenOutcome > numberOfCoins || (minimumChosenOutcome < Math.floor(numberOfCoins / 3))) {
      this.addError('InvalidMinimumChosenOutcomeErrorType')
      return
    }

    // Fetching user details
    
    const user = await inMemoryDB.get('users', userId);

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    // const userWallet = user.wallets?.length ? user.wallets[0] : null
    const userWallet = user.wallet

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    const gameSettings = await GameSettingsService.run({ gameId: DEFAULT_GAME_ID.FLIP_COIN }, this.context)

    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) {
      this.addError('ServerSeedNotFoundErrorType')
    }

    const flipCoinGameResult = await FlipCoinGameGenerateResultService.run({ serverSeed, clientSeed, numberOfCoins })
    const ones = countOnes(flipCoinGameResult)
    const favorable = heads ? ones : (numberOfCoins - ones)

    let winningAmount = 0
    let betResult = BET_RESULT.LOST

    const probability = getCoinOutcomeProbability(numberOfCoins, minimumChosenOutcome)

    if (favorable >= minimumChosenOutcome) {
      const odds = calculateOdds(gameSettings, 1 / probability)
      betResult = BET_RESULT.WON
      winningAmount = times(betAmount, odds)
      const profit = minus(winningAmount, betAmount)

      if (profit > maxBetProfit.amount) {
        winningAmount = plus(betAmount, maxBetProfit.amount)
      }
    }

    const { minOdd, maxOdd, houseEdge } = gameSettings

    try {
      const flipCoinGameBet = {
        id: uuidv4(),
        userId: userId,
        outcome: flipCoinGameResult,
        heads,
        numberOfCoins,
        minimumChosenOutcome,
        betAmount,
        currencyId,
        winningAmount,
        clientSeed: clientSeed,
        serverSeed,
        result: betResult,
        currentGameSettings: JSON.stringify({ minOdd, maxOdd, houseEdge })
      }

      await inMemoryDB.set('flipCoinGameBets', userId, flipCoinGameBet)

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
        betInfo: flipCoinGameBet
      }, userWallet.ownerId)

      if (betResult === BET_RESULT.WON) {
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
        betInfo: flipCoinGameBet
      }, userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      flipCoinGameBet.nextServerSeedHash = nextServerSeedHash

      return { ...flipCoinGameBet, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

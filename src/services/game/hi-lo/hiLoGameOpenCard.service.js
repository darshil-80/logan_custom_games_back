import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import HiLoGameGenerateResultService from './hiLoGameGenerateResult.service'
import HiLoGameCashOutBetService from './hiLoGameCashOutBet.service'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import { HILO_CARD_DECK, BET_RESULT, HI_LO_GAME_BET_TYPE, DEFAULT_GAME_ID } from '../../../libs/constants'
import HiLoGameCalculateOddsForBet from './hiloGameCalculateOddsForBet.service'
import Flatted from 'flatted'
import { calculateOdds } from '../../../utils/math.utils'
import GameSettingsService from '../common/gameSettings.service'
import inMemoryDB from '../../../libs/inMemoryDb'
import { v4 as uuidv4 } from 'uuid'
/**
 *
 *
 * @export
 * @class HiLoGameOpenCardService
 * @extends {ServiceBase}
 */
export default class HiLoGameOpenCardService extends ServiceBase {
  async run () {
    const { currencyId, userId } = this.args

    // Fetching user details
    const user = await inMemoryDB.get('users', userId);

    // Validations
    if (!user) return this.addError('NoUserFoundErrorType', `no user found ${userId}`)

    const hiLoGameBet = await inMemoryDB.get('hiloGameBets', userId)

    if (!hiLoGameBet || hiLoGameBet.result !== null) return this.addError('NoPlacedBetFoundErrorType', `no user found ${userId}`)

    const cardNumber = await HiLoGameGenerateResultService.run({
      clientSeed: `${hiLoGameBet.clientSeed}-${hiLoGameBet.betStates?.length || 0}`,
      serverSeed: hiLoGameBet.serverSeed
    }, this.context)

    const previousCardNumber = hiLoGameBet.betStates.length ? hiLoGameBet.betStates[hiLoGameBet.betStates.length - 1].openedCard : hiLoGameBet.initialCard
    const [previousCardRank] = HILO_CARD_DECK[previousCardNumber]

    if (previousCardRank === 1 && ![HI_LO_GAME_BET_TYPE.SAME, HI_LO_GAME_BET_TYPE.ABOVE].includes(+this.args.betType)) {
      return this.addError('InvalidBetTypeErrorType')
    } else if (previousCardRank === 13 && ![HI_LO_GAME_BET_TYPE.SAME, HI_LO_GAME_BET_TYPE.BELOW].includes(+this.args.betType)) {
      return this.addError('InvalidBetTypeErrorType')
    }

    let win = false
    const [currentCardRank] = HILO_CARD_DECK[cardNumber]

    if (this.args.betType === HI_LO_GAME_BET_TYPE.SAME) {
      win = currentCardRank === previousCardRank
    } else if (this.args.betType === HI_LO_GAME_BET_TYPE.ABOVE) {
      win = currentCardRank > previousCardRank
    } else if (this.args.betType === HI_LO_GAME_BET_TYPE.BELOW) {
      win = currentCardRank < previousCardRank
    } else if (this.args.betType === HI_LO_GAME_BET_TYPE.SAME_OR_ABOVE) {
      win = currentCardRank >= previousCardRank
    } else if (this.args.betType === HI_LO_GAME_BET_TYPE.SAME_OR_BELOW) {
      win = currentCardRank <= previousCardRank
    }

    try {
      const betStateId = uuidv4()
      hiLoGameBet.betStates.push({
        id: betStateId,
        betId: hiLoGameBet.id,
        betType: this.args.betType,
        openedCard: cardNumber
      })

      await inMemoryDB.set('hiloGameBets', userId, hiLoGameBet)

      hiLoGameBet.result = win ? BET_RESULT.WON : BET_RESULT.LOST
      const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.HILO }, this.context)).result

      let odds = await HiLoGameCalculateOddsForBet.run({ bet: Flatted.parse(Flatted.stringify(hiLoGameBet)) }, this.context)
      odds = calculateOdds(gameSettings, odds)
      
      hiLoGameBet.betStates.forEach(betState => {
        if(betState.id === betStateId) {
          betState.coefficient = odds
        }
      })

      hiLoGameBet.result = null;
      if (!win) {
        await HiLoGameCashOutBetService.run({ userId, currencyId, result: win ? BET_RESULT.WON : BET_RESULT.LOST }, this.context)
        hiLoGameBet.result = win ? BET_RESULT.WON : BET_RESULT.LOST;
      }

      if (!win) hiLoGameBet.nextServerSeedHash = await generateServerSeedHash(userId)
      if (!hiLoGameBet.result) hiLoGameBet.serverSeed = null

      hiLoGameBet.newCard = cardNumber

      await inMemoryDB.set('hiloGameBets', userId, hiLoGameBet)
      const updatedHiLoGameBet = await inMemoryDB.get('hiloGameBets', userId)

      return updatedHiLoGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

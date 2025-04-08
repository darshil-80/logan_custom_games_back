import ajv from '../../../libs/ajv'
import { HILO_CARD_DECK, HI_LO_GAME_BET_TYPE } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    bet: { $ref: '/hiLoGameBet.json' }
  },
  required: ['bet']
}

const constraints = ajv.compile(schema)
/**
 * @export
 * @class HiLoCalculateOddsForBet
 * @extends {ServiceBase}
 */
export default class HiLoGameCalculateOddsForBet extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const same = 4 / 52
    const aboveOrBelow = (52 - 4) / 52

    const odds = this.args.bet.betStates.reduce((odds, betState, index, betStates) => {
      let chance
      const previousCardNumber = index === 0 ? this.args.bet.initialCard : betStates[index - 1].openedCard
      const [previousCardRank] = HILO_CARD_DECK[previousCardNumber]

      if (betState.betType === HI_LO_GAME_BET_TYPE.SAME) {
        chance = same
      } else if (betState.betType === HI_LO_GAME_BET_TYPE.ABOVE) {
        chance = aboveOrBelow
      } else if (betState.betType === HI_LO_GAME_BET_TYPE.BELOW) {
        chance = aboveOrBelow
      } else if (betState.betType === HI_LO_GAME_BET_TYPE.SAME_OR_ABOVE) {
        chance = 4 * ((13 - previousCardRank) + 1) / 52
      } else if (betState.betType === HI_LO_GAME_BET_TYPE.SAME_OR_BELOW) {
        chance = previousCardRank * 4 / 52
      }

      odds *= (1 / chance)
      return odds
    }, 1.00)

    return odds || 1.00
  }
}

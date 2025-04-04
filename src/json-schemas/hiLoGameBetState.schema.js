import ajv from '../libs/ajv'
import { HI_LO_GAME_BET_TYPE } from '../libs/constants'

const hiLoGameBetState = {
  $id: '/hiLoGameBetState.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    betId: { type: 'string' },
    openedCard: { type: 'number' },
    coefficient: { type: 'number' },
    betType: { type: 'number', enum: [HI_LO_GAME_BET_TYPE.SAME_OR_ABOVE, HI_LO_GAME_BET_TYPE.SAME, HI_LO_GAME_BET_TYPE.SAME_OR_BELOW, HI_LO_GAME_BET_TYPE.ABOVE, HI_LO_GAME_BET_TYPE.BELOW] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(hiLoGameBetState)

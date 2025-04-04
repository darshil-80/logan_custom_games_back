import ajv from '../libs/ajv'
import { PLINKO_MAX_ROWS, PLINKO_MIN_ROWS } from '../libs/constants'

const plinkoGameBet = {
  $id: '/plinkoGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    numberOfRows: { type: 'number', minimum: PLINKO_MIN_ROWS, maximum: PLINKO_MAX_ROWS },
    riskLevel: { type: 'number', minimum: 1, maximum: 3 },
    isLightningMode: { type: 'boolean' },
    dropDetails: { type: 'string' },
    winningSlot: { type: 'number' },
    betAmount: { type: ['number', 'string'] },
    winningAmount: { type: ['number', 'string'] },
    result: { type: ['string'] },
    clientSeed: { type: ['string'] },
    serverSeed: { type: ['string'] },
    currentGameSettings: { type: 'string' },
    nextServerSeedHash: { type: 'string' },
    demo: { type: 'boolean', default: false },
    demoAmount: { type: 'number' },
    currencyId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: { $ref: '/user.json' }
  }
}

ajv.addSchema(plinkoGameBet)

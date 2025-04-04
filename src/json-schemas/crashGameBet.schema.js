import ajv from '../libs/ajv'

const crashGameBet = {
  $id: '/crashGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    roundId: { type: ['string', 'null'] },
    autoRate: { type: 'number' },
    escapeRate: { type: 'number' },
    betAmount: { type: 'number' },
    winningAmount: { type: 'number' },
    result: { type: ['string', 'null'] },
    currencyId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: { $ref: '/user.json' }
  }
}

ajv.addSchema(crashGameBet)

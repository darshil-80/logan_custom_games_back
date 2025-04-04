import ajv from '../libs/ajv'

const hiLoGameBet = {
  $id: '/hiLoGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    initialCard: { type: 'number', minimum: 1, maximum: 52 },
    betAmount: { type: 'number' },
    winningAmount: { type: 'number' },
    result: { type: ['string'] },
    clientSeed: { type: ['string'] },
    serverSeed: { type: ['string'] },
    currencyId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    nextServerSeedHash: { type: 'string' },
    demo: { type: 'boolean', default: false },
    demoAmount: { type: 'number' },
    user: { $ref: '/user.json' },
    currentGameSettings: { type: 'string' },
    betStates: { type: 'array', items: { $ref: '/hiLoGameBetState.json' } }
  }
}

ajv.addSchema(hiLoGameBet)

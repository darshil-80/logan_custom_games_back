import ajv from '../libs/ajv'

const flipCoinGameBet = {
  $id: '/flipCoinGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    numberOfCoins: { type: ['string', 'number'] },
    heads: { type: 'boolean' },
    minimumChosenOutcome: { type: ['string', 'number'] },
    outcome: { type: 'string' },
    betAmount: { type: 'number' },
    winningAmount: { type: 'number' },
    result: { type: ['string'] },
    clientSeed: { type: ['string'] },
    serverSeed: { type: ['string'] },
    nextServerSeedHash: { type: 'string' },
    demo: { type: 'boolean', default: false },
    demoAmount: { type: 'number' },
    currencyId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    currentGameSettings: { type: 'string' },
    user: { $ref: '/user.json' }
  }
}

ajv.addSchema(flipCoinGameBet)

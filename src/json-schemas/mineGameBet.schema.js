import ajv from '../libs/ajv'

const mineGameBet = {
  $id: '/mineGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    mineCount: { type: 'number' },
    mineTiles: { type: 'array', items: { type: 'number' } },
    betAmount: { type: 'number' },
    winningAmount: { type: 'number' },
    result: { type: ['string'] },
    clientSeed: { type: ['string'] },
    serverSeed: { type: ['string'] },
    currentGameSettings: { type: 'string' },
    nextServerSeedHash: { type: 'string' },
    currencyId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: { $ref: '/user.json' },
    playStates: { type: 'array', items: { $ref: '/mineGamePlayState.json' } }
  }
}

ajv.addSchema(mineGameBet)

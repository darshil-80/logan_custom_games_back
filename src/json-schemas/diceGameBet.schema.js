import ajv from '../libs/ajv'

const diceGameBet = {
  $id: '/diceGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    number: { type: 'number' },
    rollOver: { type: 'boolean' },
    winningNumber: { type: 'number' },
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
    user: { $ref: '/user.json' }
  }
}

ajv.addSchema(diceGameBet)

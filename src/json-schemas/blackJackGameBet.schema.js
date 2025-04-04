import ajv from '../libs/ajv'

const blackJackGameBet = {
  $id: '/blackJackGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    betAmount: { type: 'number' },
    winningAmount: { type: 'number' },
    result: { type: ['string', 'null'] },
    gameResult: { type: ['string', 'null'] },
    currencyId: { type: 'string' },
    playerHand: { type: 'array' },
    dealerHand: { type: 'array' },
    playersPoint: { type: 'number' },
    dealersPoint: { type: 'number' },
    currentGameSettings: { type: 'string' },
    clientSeed: { type: 'string' },
    serverSeed: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: { $ref: '/user.json' }
  }
}

ajv.addSchema(blackJackGameBet)

import ajv from '../libs/ajv'

const cryptoFuturesGameBet = {
  $id: '/cryptoFuturesGameBet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    isBuy: { type: 'boolean' },
    multiplier: { type: 'number' },
    entryPrice: { type: 'number' },
    exitPrice: { type: 'number' },
    bustPrice: { type: 'number' },
    stopLossPrice: { type: 'number' },
    takeProfitPrice: { type: 'number' },
    betAmount: { type: 'number' },
    winningAmount: { type: 'number' },
    result: { type: ['string', 'null'] },
    currencyId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: { $ref: '/user.json' }
  }
}

ajv.addSchema(cryptoFuturesGameBet)

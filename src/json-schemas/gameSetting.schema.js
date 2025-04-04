import ajv from '../libs/ajv'

const gameSetting = {
  $id: '/gameSetting.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    gameId: { type: 'string' },
    minBet: { type: 'object' },
    maxBet: { type: 'object' },
    maxProfit: { type: 'object' },
    houseEdge: { type: 'number' },
    minOdds: { type: 'number' },
    maxOdds: { type: 'number' },
    minAutoRate: { type: 'number' },
    maxNumberOfAutoBets: { type: 'number' },
    gameDetails: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(gameSetting)

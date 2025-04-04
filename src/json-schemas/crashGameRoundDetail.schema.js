import ajv from '../libs/ajv'

const crashGameRoundDetail = {
  $id: '/crashGameRoundDetail.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    roundId: { type: 'string' },
    roundState: { type: 'string' },
    crashRate: { type: 'number' },
    roundSignature: { type: 'string' },
    roundHash: { type: 'string' },
    currentGameSettings: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    onHoldAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(crashGameRoundDetail)

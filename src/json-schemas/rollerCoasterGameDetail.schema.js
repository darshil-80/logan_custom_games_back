import ajv from '../libs/ajv'

const rollerCoasterGameRoundDetail = {
  $id: '/rollerCoasterGameRoundDetail.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    roundId: { type: 'string' },
    roundState: { type: 'string' },
    roundSignature: { type: 'string' },
    roundHash: { type: 'string' },
    currentGameSettings: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    onHoldAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(rollerCoasterGameRoundDetail)

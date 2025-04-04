import ajv from '../libs/ajv'

const mineGamePlayState = {
  $id: '/mineGamePlayState.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    betId: { type: 'string' },
    tile: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(mineGamePlayState)

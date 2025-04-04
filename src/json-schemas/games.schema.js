import ajv from '../libs/ajv'

const games = {
  $id: '/games.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(games)

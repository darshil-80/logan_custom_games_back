import ajv from '../libs/ajv'

const userToken = {
  $id: '/userToken.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    token: { type: 'string' },
    tokenType: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(userToken)

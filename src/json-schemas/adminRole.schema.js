import ajv from '../libs/ajv'

const adminRole = {
  $id: '/adminRole.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    resourceType: { type: 'string' },
    resourceId: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(adminRole)

import ajv from '../libs/ajv'

const adSponsor = {
  $id: '/adSponsor.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    imageUrl: { type: 'string' },
    redirectUrl: { type: 'string' },
    enabled: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(adSponsor)

import ajv from '../libs/ajv'

const affiliate = {
  $id: '/affiliate.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    code: { type: 'string' },
    ownerId: { type: 'string' },
    status: { type: 'string' },
    ownerType: { type: 'string' },
    url: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(affiliate)

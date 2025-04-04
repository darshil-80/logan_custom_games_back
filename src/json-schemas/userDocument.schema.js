import ajv from '../libs/ajv'

const userDocument = {
  $id: '/userDocument.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    documentUrl: { type: 'string' },
    documentName: { type: 'string' },
    isVerified: { type: 'boolean' },
    status: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(userDocument)

import ajv from '../libs/ajv'

const socialAccount = {
  $id: '/socialAccount.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    socialAccount: { type: 'string' },
    username: { type: 'string' },
    actioneeId: { type: 'string' },
    status: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(socialAccount)

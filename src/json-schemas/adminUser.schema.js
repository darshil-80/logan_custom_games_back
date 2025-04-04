import ajv from '../libs/ajv'

const adminUser = {
  $id: '/adminUser.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' },
    phoneVerified: { type: 'boolean' },
    parentType: { type: 'string' },
    parentId: { type: 'number' },
    email: { type: 'string' },
    encryptedPassword: { type: 'string' },
    resetPasswordToken: { type: 'string' },
    resetPasswordSentAt: { type: 'string', format: 'date-time' },
    rememberCreatedAt: { type: 'string', format: 'date-time' },
    confirmationToken: { type: 'string' },
    confirmedAt: { type: 'string', format: 'date-time' },
    confirmationSentAt: { type: 'string', format: 'date-time' },
    unconfirmedEmail: { type: 'string' },
    active: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(adminUser)

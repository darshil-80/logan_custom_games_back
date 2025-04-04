import ajv from '../libs/ajv'

const adminUsersAdminRole = {
  $id: '/adminUsersAdminRole.json',
  type: 'object',
  properties: {
    adminUserId: { type: 'number' },
    adminRoleId: { type: 'number' }
  }
}

ajv.addSchema(adminUsersAdminRole)

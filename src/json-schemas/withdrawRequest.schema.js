import ajv from '../libs/ajv'

const withdrawRequest = {
  $id: '/withdrawRequest.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    status: { type: 'string' },
    name: { type: 'string' },
    accountNumber: { type: 'string' },
    ifscCode: { type: 'string' },
    amount: { type: 'number' },
    phoneNumber: { type: 'string' },
    transactionId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    actionableType: { type: 'string' },
    actionableId: { type: 'number' },
    actionedAt: { type: 'string', format: 'date-time' },
    walletAddress: { type: 'string' },
    walletId: { type: 'string' }
  }
}

ajv.addSchema(withdrawRequest)

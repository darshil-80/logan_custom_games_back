import ajv from '../libs/ajv'

const wallet = {
  $id: '/wallet.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    amount: { type: 'number' },
    primary: { type: 'boolean' },
    currencyId: { type: 'string' },
    ownerType: { type: 'string' },
    ownerId: { type: 'string' },
    nonCashAmount: { type: 'number' },
    bonusBalance: { type: 'number' },
    walletAddress: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(wallet)

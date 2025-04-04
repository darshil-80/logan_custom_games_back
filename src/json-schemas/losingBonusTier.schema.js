import ajv from '../libs/ajv'

const losingBonusTier = {
  $id: '/losingBonusTier.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    losingBonusSettingId: { type: 'number' },
    minLosingAmount: { type: 'number' },
    percentage: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(losingBonusTier)

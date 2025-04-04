import ajv from '../libs/ajv'

const bonus = {
  $id: '/bonus.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    code: { type: 'string' },
    percentage: { type: 'number' },
    enabled: { type: 'boolean' },
    validFrom: { type: 'string', format: 'date-time' },
    validUpto: { type: 'string', format: 'date-time' },
    kind: { type: 'string' },
    currencyId: { type: 'number' },
    promotionTitle: { type: 'string' },
    image: { type: 'string' },
    termsAndConditions: { type: 'string' },
    vipLevels: { elements: { type: 'string' } },
    usageCount: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(bonus)

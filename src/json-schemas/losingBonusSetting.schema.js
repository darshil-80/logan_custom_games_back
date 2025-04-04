import ajv from '../libs/ajv'

const losingBonusSetting = {
  $id: '/losingBonusSetting.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    bonusId: { type: 'number' },
    claimDays: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(losingBonusSetting)

import ajv from '../libs/ajv'

const depositBonusSetting = {
  $id: '/depositBonusSetting.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    minDeposit: { type: 'number' },
    maxBonus: { type: 'number' },
    rolloverMultiplier: { type: 'number' },
    maxRolloverPerBet: { type: 'number' },
    validForDays: { type: 'number' },
    bonusId: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(depositBonusSetting)

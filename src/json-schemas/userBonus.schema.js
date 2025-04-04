import ajv from '../libs/ajv'

const userBonus = {
  $id: '/userBonus.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { enum: ['active', 'claimed', 'cancelled', 'expired'] },
    bonusAmount: { type: 'number' },
    userId: { type: 'string' },
    bonusId: { type: 'string' },
    expiresAt: { type: 'number' },
    claimedAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    transactionId: { type: ['string', 'null'] },
    bonusType: { type: 'string' },
    freeSpinsQty: { type: ['number', 'null'] },
    amountToWager: { type: ['number', 'null'] },
    wageredAmount: { type: ['number', 'null'] },
    wageringStatus: { type: 'string' },
    readyToClaimAt: { type: ['string', 'null'], format: 'date-time' },
    games: { type: ['object', 'null'] },
    cashAmount: { type: ['number', 'null'] },
    amountConverted: { type: ['number', 'null'] },
    cancelledBy: { type: ['string', 'null'] },
    claimedCount: { type: ['string', 'null'] },
    referredUserId: { type: ['string', 'null'] },
    splitBonusAmount: { type: ['number', 'null'] },
    directBonusAmount: { type: ['number', 'null'] }
  }
}

ajv.addSchema(userBonus)

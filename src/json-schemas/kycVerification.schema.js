import ajv from '../libs/ajv'

const kycVerification = {
  $id: '/kycVerification.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    verificationLevel: { type: 'string' },
    kycStatus: { type: 'string' },
    sumsubApplicantId: { type: ['string', 'null'] },
    actionableId: { type: ['string', 'null'] },
    actionPerformedAt: { type: ['string', 'null'] },
    reason: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(kycVerification)

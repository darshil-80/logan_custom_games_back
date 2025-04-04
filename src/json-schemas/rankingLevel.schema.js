import ajv from '../libs/ajv'

const games = {
  $id: '/rankingLevel.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    rank: { type: 'string' },
    wagerRequirement: { type: 'number' },
    status: { type: 'boolean' },
    description: { type: 'string' },
    imageLogo: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    moreDetails: { type: 'object' }
  }
}

ajv.addSchema(games)

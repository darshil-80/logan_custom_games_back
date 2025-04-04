import ajv from '../libs/ajv'

const banner = {
  $id: '/banner.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: ['string', 'null'] },
    imageUrl: { type: ['string', 'null'] },
    redirectUrl: { type: ['string', 'null'] },
    bannerType: { type: ['string', 'null'] },
    order: { type: ['number', 'null'] },
    enabled: { type: 'boolean' },
    isMobile: { type: 'boolean' },
    mobileImageUrl: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(banner)

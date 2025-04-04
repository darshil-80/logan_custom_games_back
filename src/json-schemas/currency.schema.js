import ajv from '../libs/ajv'

const currency = {
  $id: '/currency.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    code: { type: 'string' },
    primary: { type: 'boolean' },
    exchangeRate: { type: ['number', 'null'] },
    isFiat: { type: 'boolean' },
    image: { type: 'string' },
    units: { type: 'object' },
    symbol: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(currency)

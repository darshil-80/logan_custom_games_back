import ajv from '../libs/ajv'

const transaction = {
  $id: '/rollerCoasterGraphDetail.json',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      transaction_date: { type: 'string' },
      low: { type: 'string' },
      high: { type: 'string' },
      close: { type: 'string' },
      open: { type: 'string' },
      price: { type: 'string' },
      startTimestamp: { type: 'string' }
    }
  }
}
ajv.addSchema(transaction)

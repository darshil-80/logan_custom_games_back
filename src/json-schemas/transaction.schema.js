import ajv from '../libs/ajv'

const transaction = {
  $id: '/transaction.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    actioneeType: { type: 'string' },
    actioneeId: { type: 'string' },
    sourceWalletId: { type: ['string', 'null'] },
    targetWalletId: { type: ['string', 'null'] },
    amount: { type: 'number' },
    status: { type: 'string' },
    comments: { type: ['string', 'null'] },
    transactionType: { type: ['string', 'null'] },
    gameId: { type: ['string', 'null'] },
    betId: { type: ['number', 'null'] },
    transactionId: { type: ['string', 'null'] },
    moreDetails: { type: ['object', 'null'] },
    debitTransactionId: { type: ['string', 'null'] },
    paymentMethod: { type: ['string', 'null'] },
    coinPaymentTxnId: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}
ajv.addSchema(transaction)

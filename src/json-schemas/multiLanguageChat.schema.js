import ajv from '../libs/ajv'

const MultiLanguageChat = {
  $id: '/multiLanguageChat.json',
  type: 'object',
  properties: {
    id: { type: 'number' },
    language: { type: 'string' },
    status: { type: 'boolean' },
    languageLogo: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(MultiLanguageChat)

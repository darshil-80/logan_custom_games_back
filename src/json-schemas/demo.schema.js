import ajv from '../libs/ajv'

/** @type {import("ajv").Schema} */
const demoSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' }
  },
  required: ['name']
}

ajv.addSchema(demoSchema, '/demo.json')

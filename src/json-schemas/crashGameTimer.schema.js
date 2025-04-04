import ajv from '../libs/ajv'

const crashGameTimerSchema = {
  $id: '/crashGameTimer.json',
  type: 'object',
  properties: {
    seconds: { type: 'number' },
    secondTenths: { type: 'number' },
    runningStatus: { type: 'boolean' },
    onHoldAt: { type: 'string', format: 'date-time' },
    roundId: { type: 'string' }
  }
}

ajv.addSchema(crashGameTimerSchema)

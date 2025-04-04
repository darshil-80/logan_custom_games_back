import ajv from '../libs/ajv'

const LoginLog = {
  $id: '/loginLog.json',
  type: 'object',
  properties: {
    id: { type: 'string' },
    loginTime: { type: 'string' },
    userId: { type: 'number' },
    userName: { type: 'string' },
    loginIp: { type: 'string' },
    loginDeviceCode: { type: ['string', 'null'] },
    appVersion: { type: ['string', 'null'] },
    device: { type: ['string', 'null'] },
    systemVersion: { type: ['string', 'null'] },
    deviceType: { type: ['string', 'null'] },
    vipLevel: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  }
}

ajv.addSchema(LoginLog)

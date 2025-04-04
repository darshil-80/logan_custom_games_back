import config from '../../configs/app.config'

export default function verifyEarCasinoBasicAuthMiddleware (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Unauthorized' })
  } else {
    const base64Credentials = req.headers.authorization.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')
    if (parseInt(username) !== config.get('ear_casino.client_id') || password !== config.get('ear_casino.client_secret')) {
      return res.status(401).json({ message: 'Unauthorized' })
    } else {
      return next()
    }
  }
}

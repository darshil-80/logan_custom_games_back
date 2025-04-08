import { InvalidTokenErrorType } from '../../libs/errorTypes'
import Logger from '../../libs/logger'
import inMemoryDB from '../../libs/inMemoryDb'

export default async function authenticationSocketNamespaceMiddleWare (socket, next) {
  try {
    const { auth } = socket.handshake

    socket.auth = await inMemoryDB.get('users', auth.userid)
    next()
  } catch (err) {
    Logger.error('Error in authenticationSocketMiddleware', {
      message: err.message,
      context: socket.handshake,
      exception: err
    })

    next(InvalidTokenErrorType)
  }
}

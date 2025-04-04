import { SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'
import authenticationSocketNamespaceMiddleWare from '../middlewares/authenticationSocketNamespace.middleware'

/**
 *
 *
 * @export
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(SOCKET_NAMESPACES.WALLET)
  namespace.use(authenticationSocketNamespaceMiddleWare)
  namespace.on('connection', (socket) => {
    if(socket?.auth?.id) {
      socket.join(SOCKET_ROOMS.WALLET_USER + ':' + socket.auth.id)
    }
  })
}

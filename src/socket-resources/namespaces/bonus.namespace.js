import { SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'
import authenticationSocketNamespaceMiddleWare from '../middlewares/authenticationSocketNamespace.middleware'

/**
 *
 *
 * @export
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(SOCKET_NAMESPACES.BONUS)

  namespace.use(authenticationSocketNamespaceMiddleWare)

  namespace.on('connection', (socket) => {
    socket.join(SOCKET_ROOMS.BONUS_USER + ':' + socket.auth.id)
  })
}

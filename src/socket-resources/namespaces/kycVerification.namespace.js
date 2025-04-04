import { SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'
import authenticationSocketNamespaceMiddleWare from '../middlewares/authenticationSocketNamespace.middleware'

/**
 *
 *
 * @export
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(SOCKET_NAMESPACES.KYC_VERIFICATION)

  namespace.use(authenticationSocketNamespaceMiddleWare)

  namespace.on('connection', (socket) => {
    socket.join(SOCKET_ROOMS.USER_KYC_VERIFICATION + ':' + socket.auth.id)
  })
}

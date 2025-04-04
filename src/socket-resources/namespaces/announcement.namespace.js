import { SOCKET_NAMESPACES } from '../../libs/constants'
// import authenticationSocketNamespaceMiddleWare from '../middlewares/authenticationSocketNamespace.middleware'

/**
 *
 *
 * @export
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(SOCKET_NAMESPACES.ANNOUNCEMENT)

  // namespace.use(authenticationSocketNamespaceMiddleWare)

  namespace.on('connection', (socket) => {

  })
}

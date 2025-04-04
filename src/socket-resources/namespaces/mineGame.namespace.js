import { SOCKET_NAMESPACES } from '../../libs/constants'

/**
 *
 *
 * @export
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(SOCKET_NAMESPACES.MINE_GAME)

  namespace.on('connection', (socket) => {

  })
}

import crashGameNamespace from './crashGame.namespace'
import walletNamespace from './wallet.namespace'
import mineGameNamespace from './mineGame.namespace'
import plinkoGameNamespace from './plinkoGame.namespace'

export default function (io) {
  crashGameNamespace(io)
  walletNamespace(io)
  mineGameNamespace(io)
  plinkoGameNamespace(io)
}

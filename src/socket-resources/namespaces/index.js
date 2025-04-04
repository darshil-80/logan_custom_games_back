import crashGameNamespace from './crashGame.namespace'
import demoNamespace from './demo.namespace'
import walletNamespace from './wallet.namespace'
import liveWinsNamespace from './liveWins.namespace'
import chatNamespace from './chat.namespace'
import rollerCoasterGameNamespace from './rollerCoasterGame.namespace'
import announcementNamespace from './announcement.namespace'
import cryptoFuturesNamespace from './cryptoFutures.namespace'
import mineGameNamespace from './mineGame.namespace'
import plinkoGameNamespace from './plinkoGame.namespace'
import kycVerificationNamespace from './kycVerification.namespace'
import bonusNamespace from './bonus.namespace'
import rankingLevelNamespace from './rankingLevel.namespace'
import wageringNamespace from './wagering.namespace'

export default function (io) {
  crashGameNamespace(io)
  demoNamespace(io)
  walletNamespace(io)
  // liveWinsNamespace(io)
  // chatNamespace(io)
  // rollerCoasterGameNamespace(io)
  // announcementNamespace(io)
  // cryptoFuturesNamespace(io)
  mineGameNamespace(io)
  plinkoGameNamespace(io)
  // kycVerificationNamespace(io)
  // bonusNamespace(io)
  // rankingLevelNamespace(io)
  // wageringNamespace(io)
}

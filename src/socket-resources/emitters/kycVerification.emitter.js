import Flatted from 'flatted'
import Logger from '../../libs/logger'
import socketEmitter from '../../libs/socketEmitter'
import { SOCKET_EMITTERS, SOCKET_NAMESPACES, SOCKET_ROOMS } from '../../libs/constants'

/**
 * Wallet Emitter for Emitting things related to the /wallet namespace
 *
 * @export
 * @class WalletEmitter
 */
export default class kycVerificationEmitter {
  static async emitKycVerification (payload, userId) {
    try {
      payload = Flatted.parse(Flatted.stringify(payload))
      const room = SOCKET_ROOMS.USER_KYC_VERIFICATION + ':' + userId
      socketEmitter.of(SOCKET_NAMESPACES.KYC_VERIFICATION).to(room).emit(SOCKET_EMITTERS.KYC_VERIFICATION_STATUS, { data: payload })
    } catch (error) {
      Logger.info('Error In Emitter', { message: 'Error in Emitter while emitting kyc verification status' })
      Logger.info('Actual Error', { exception: error })
    }
  }
}

import ServiceBase from '../../libs/serviceBase'
import ajv from '../../libs/ajv'
import { USER_TYPES } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    walletId: { type: 'string' }
  },
  required: ['walletId']
}
const constraints = ajv.compile(schema)

/**
 * Provides service to user to set primary wallet
 * @export
 * @class PrimaryWalletService
 * @extends {ServiceBase}
 */
export default class SetPrimaryWalletService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { Wallet: WalletModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const userObj = {
      walletId: this.args.walletId
    }

    const wallets = await WalletModel.findAll({
      where: { ownerId: userId, ownerType: USER_TYPES.USER },
      transaction: sequelizeTransaction
    })

    if (!wallets) { return this.addError('NoWalletFoundErrorType', 'Wallet not found') }

    const isValidWallet = wallets.map(wallet => wallet.id).includes(userObj.walletId)
    if (!isValidWallet) { return this.addError('WalletDoesNotBelongToUserErrorType', 'Not Valid WalletId') }

    for (const wallet of wallets) {
      wallet.primary = wallet.id === userObj.walletId
      await wallet.save({ transaction: sequelizeTransaction })
    }

    return { message: 'Primary Wallet Saved Successfully' }
  }
}

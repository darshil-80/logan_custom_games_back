import ajv from '../../libs/ajv'
import { fireBlocks } from '../../libs/fireBlock'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    currencyCode: { type: 'string' },
    currencyId: { type: 'integer' }
  },
  required: ['currencyCode', 'currencyId']
}

const constraints = ajv.compile(schema)
export default class GenerateAddressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { Wallet: WalletModel, User: UserModel },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    try {
      const walletObj = {
        currencyCode: this.args.currencyCode,
        currencyId: this.args.currencyId
      }
      const wallet = await WalletModel.findOne({
        where: { ownerId: userId, currencyId: walletObj.currencyId },
        transaction: sequelizeTransaction
      })

      if (wallet.walletAddress) {
        return wallet
      }

      const user = await UserModel.findOne({ where: { id: userId } })

      let vaultDetail = { id: user.vaultId }
      if (!user.vaultId) {
        vaultDetail = await fireBlocks.createVaultAccount(`${user.userName + user.id}`, false, `${user.id}`, true)
        user.vaultId = vaultDetail.id
        await user.save({ transaction: sequelizeTransaction })
      }
      const address = await fireBlocks.createVaultAsset(vaultDetail.id, this.args.currencyCode)

      await wallet.update({ walletAddress: address.address }, {
        transaction: sequelizeTransaction
      })
      return wallet
    } catch (error) {
      console.log(error)
      return this.addError('GenerateWalletAddressService', 'Error in generating wallet')
    }
  }
}

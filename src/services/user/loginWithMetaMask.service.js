import jwt from 'jsonwebtoken'
import config from '../../configs/app.config'
import ajv from '../../libs/ajv'
import web3 from '../../libs/web3'
import { setData } from '../../helpers/redis.helpers'
import ServiceBase from '../../libs/serviceBase'
import { getUserTokenCacheKey } from '../../utils/user.utils'
import { LOGIN_METHODS } from '../../libs/constants'
import { nanoid } from 'nanoid'
import { generateServerSeedHash } from '../../helpers/encryption.helpers'

const schema = {
  type: 'object',
  properties: {
    ethereumAddress: { type: 'string' },
    signedMessage: { type: 'string' }
  },
  required: ['ethereumAddress', 'signedMessage']
}

const constraints = ajv.compile(schema)

/**
 * it provides service of login with meta mask for a user
 * @export
 * @class LoginWithMetaMaskService
 * @extends {ServiceBase}
 */
export default class LoginWithMetaMaskService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: { User: UserModel, RankingLevel: RankingLevelModel },
      sequelizeTransaction
    } = this.context

    const ethereumAddress = String(this.args.ethereumAddress).toLowerCase()
    const signedMessage = this.args.signedMessage

    if (!web3.utils.isAddress(ethereumAddress)) {
      return this.addError(
        'InvalidBlockchainAddressErrorType',
        `ethereumAddress: ${ethereumAddress}`
      )
    }

    const whereCondition = {
      ethereumAddress: ethereumAddress
    }

    const user = await UserModel.findOne({
      where: whereCondition,
      attributes: { exclude: ['encryptedPassword'] },
      transaction: sequelizeTransaction
    })

    if (!user?.active) {
      return this.addError(
        'AccountNotActiveErrorType',
        `User account status: ${user.active}`
      )
    }
    const rankingLevel = await RankingLevelModel.findOne({
      where: { rank: 'Beginner' },
      transaction: sequelizeTransaction
    })
    const message = `${config.get('meta_mask.sign_message')} \n Nonce : ${user.nonce}`
    const recoveredBlockchainAddress = String(await web3.eth.accounts.recover(message, signedMessage)).toLowerCase()

    if (recoveredBlockchainAddress !== ethereumAddress) {
      return this.addError(
        'AddressMismatchErrorType',
        `Given Address: ${ethereumAddress}`
      )
    }

    try {
      const accessToken = await jwt.sign({ id: user.id }, config.get('jwt.loginTokenSecret'), { expiresIn: config.get('jwt.loginTokenExpiry') })

      // after successful login empty nonce
      user.nonce = null

      user.signInCount += 1

      user.loginMethod = LOGIN_METHODS.METAMASK

      user.signInIp =
        (this.context.req.headers['x-forwarded-for'] || '').split(',')[0] ||
        this.context.req.connection.remoteAddress

      user.rankingLevel = rankingLevel.id

      user.lastLogin = Date.now()

      if (!user.userName) {
        user.userName = nanoid(8)
      }

      await user.save({ transaction: sequelizeTransaction })

      // set token in redis
      const cacheTokenKey = getUserTokenCacheKey(user.id)
      setData(cacheTokenKey, accessToken, config.get('jwt.loginTokenExpiry'))

      const { serverSeedHash } = await generateServerSeedHash(user.id)

      return { accessToken, serverSeedHash, user: user.toJSON() }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', error.message)
    }
  }
}

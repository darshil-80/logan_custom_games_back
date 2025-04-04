import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import jwt from 'jsonwebtoken'
import config from '../../configs/app.config'
import { getUserTokenCacheKey } from '../../utils/user.utils'
import { setData } from '../../helpers/redis.helpers'
import { LOGIN_METHODS } from '../../libs/constants'
import { nanoid } from 'nanoid'
import { generateServerSeedHash } from '../../helpers/encryption.helpers'

const schema = {
  type: 'object',
  properties: {
    code: { type: 'string' }
  },
  required: ['code']
}

const constraints = ajv.compile(schema)

/**
 * it provides service of login with twitch for a user
 * @export
 * @class LoginWithTwitchService
 * @extends {ServiceBase}
 */
export default class LoginWithPhantomService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        Currency: CurrencyModel,
        RankingLevel: RankingLevelModel,
        Wallet: WalletModel
      },
      sequelizeTransaction
    } = this.context

    const code = this.args.code

    const rankingLevel = await RankingLevelModel.findOne({
      where: { rank: 'Beginner' },
      transaction: sequelizeTransaction
    })

    const userName = nanoid(8)
    const userObj = {
      userName,
      ethereumAddress: code,
      loginMethod: LOGIN_METHODS.PHANTOM,
      rankingLevel: rankingLevel.id,
      signInIp:
        (this.context.req.headers['x-forwarded-for'] || '').split(',')[0] ||
        this.context.req.connection.remoteAddress
    }

    const currencies = await CurrencyModel.findAll({
      transaction: sequelizeTransaction
    })

    const wallets = currencies.map((currency) => {
      return {
        amount: '0',
        currencyId: currency.id,
        primary: currency.primary
      }
    })

    userObj.wallets = wallets

    const user = await UserModel.findOne({
      where: { ethereumAddress: code },
      attributes: { exclude: ['encryptedPassword'] }
    })

    if (!user) {
      const newUser = await UserModel.create(userObj, {
        attributes: { exclude: ['encryptedPassword'] },
        include: [
          {
            model: WalletModel,
            as: 'wallets'
          }
        ],
        transaction: sequelizeTransaction
      })
      const accessToken = await jwt.sign({ id: newUser.id }, config.get('jwt.loginTokenSecret'), { expiresIn: config.get('jwt.loginTokenExpiry') })
      // set token in redis
      const cacheTokenKey = getUserTokenCacheKey(newUser.id)
      setData(cacheTokenKey, accessToken, config.get('jwt.loginTokenExpiry'))
      const { serverSeedHash } = await generateServerSeedHash(newUser.id)

      return { accessToken, serverSeedHash, newUser, message: 'User Registered' }
    } else {
      const accessToken = await jwt.sign({ id: user.id }, config.get('jwt.loginTokenSecret'), { expiresIn: config.get('jwt.loginTokenExpiry') })

      user.signInCount += 1
      user.signInIp =
        (this.context.req.headers['x-forwarded-for'] || '').split(',')[0] ||
        this.context.req.connection.remoteAddress
      user.lastLogin = Date.now()

      await user.save({ transaction: sequelizeTransaction })

      // set token in redis
      const cacheTokenKey = getUserTokenCacheKey(user.id)
      setData(cacheTokenKey, accessToken, config.get('jwt.loginTokenExpiry'))
      const { serverSeedHash } = await generateServerSeedHash(user.id)

      return { accessToken, serverSeedHash, user: user.toJSON() }
    }
  }
}

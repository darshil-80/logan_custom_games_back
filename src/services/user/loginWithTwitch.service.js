import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import jwt from 'jsonwebtoken'
import config from '../../configs/app.config'
import { getUserTokenCacheKey } from '../../utils/user.utils'
import { setData } from '../../helpers/redis.helpers'
import { LINKED_METHODS, LOGIN_METHODS } from '../../libs/constants'
import axios from 'axios'
import { generateServerSeedHash } from '../../helpers/encryption.helpers'

const schema = {
  type: 'object',
  properties: {
    code: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * it provides service of login with twitch for a user
 * @export
 * @class LoginWithTwitchService
 * @extends {ServiceBase}
 */
export default class LoginWithTwitchService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        Currency: CurrencyModel,
        RankingLevel: RankingLevelModel,
        Wallet: WalletModel,
        LinkedSocialAccount: LinkedSocialAccountModel
      },
      sequelizeTransaction
    } = this.context

    const code = this.args.code

    const twitchLoginData = {
      client_id: config.get('twitch_login.client_id'),
      client_secret: config.get('twitch_login.client_secret'),
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.get('user_frontend_app_url')
    }

    const twitchDetails = await axios.post('https://id.twitch.tv/oauth2/token', twitchLoginData)
    const { access_token: accessToken } = twitchDetails.data

    const userDetails = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': config.get('twitch_login.client_id')
      }
    })

    const { data } = userDetails.data
    const userData = data[0]
    const rankingLevel = await RankingLevelModel.findOne({
      where: { rank: 'Beginner' },
      transaction: sequelizeTransaction
    })
    const userObj = {
      firstName: userData.display_name,
      email: userData.email,
      userName: userData.login,
      emailVerified: true,
      loginMethod: LOGIN_METHODS.TWITCH,
      rankingLevel: rankingLevel.id,
      profileImageUrl: userData.profile_image_url,
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

    const whereCondition = {
      userName: userData.display_name
    }

    const user = await UserModel.findOne({
      where: whereCondition,
      attributes: { exclude: ['encryptedPassword'] },
      transaction: sequelizeTransaction
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

      const linkedUserObj = {
        socialAccount: LINKED_METHODS.TWITCH,
        username: userData.display_name,
        actioneeId: newUser.id,
        status: true
      }

      await LinkedSocialAccountModel.create(linkedUserObj, {
        transaction: sequelizeTransaction
      })

      const accessToken = await jwt.sign({ id: newUser.id }, config.get('jwt.loginTokenSecret'), { expiresIn: config.get('jwt.loginTokenExpiry') })
      // set token in redis
      const cacheTokenKey = getUserTokenCacheKey(newUser.id)
      setData(cacheTokenKey, accessToken, config.get('jwt.loginTokenExpiry'))
      const { serverSeedHash } = await generateServerSeedHash(newUser.id)

      return { accessToken, newUser, serverSeedHash, message: 'User Registered' }
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

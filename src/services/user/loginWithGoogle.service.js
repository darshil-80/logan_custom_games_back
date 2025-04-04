import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import config from '../../configs/app.config'
import { getUserTokenCacheKey } from '../../utils/user.utils'
import { setData } from '../../helpers/redis.helpers'
import { LOGIN_METHODS } from '../../libs/constants'
import { generateServerSeedHash } from '../../helpers/encryption.helpers'

const schema = {
  type: 'object',
  properties: {
    code: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * it provides service of login with google for a user
 * @export
 * @class LoginWithGoogleService
 * @extends {ServiceBase}
 */
export default class LoginWithGoogleService extends ServiceBase {
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

    const oAuth2Client = new OAuth2Client(
      config.get('google_login.client_id'),
      config.get('google_login.client_secret'),
      'postmessage'
    )

    const code = this.args.code
    const { tokens } = await oAuth2Client.getToken(code)

    const jwtToken = tokens.id_token
    const tokenParts = jwtToken.split('.')
    const encodedPayload = tokenParts[1]
    const rawPayload = atob(encodedPayload)
    const userDetails = JSON.parse(rawPayload)

    const rankingLevel = await RankingLevelModel.findOne({
      where: { rank: 'Beginner' },
      transaction: sequelizeTransaction
    })

    const userObj = {
      firstName: userDetails.given_name,
      lastName: userDetails.family_name,
      email: userDetails.email,
      userName: userDetails.given_name,
      nickName: userDetails.name,
      emailVerified: true,
      loginMethod: LOGIN_METHODS.GOOGLE,
      profileImageUrl: userDetails.picture,
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

    const whereCondition = {
      email: userDetails.email
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

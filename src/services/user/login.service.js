import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { nanoid } from 'nanoid'
import speakeasy from 'speakeasy'
import ajv from '../../libs/ajv'
import config from '../../configs/app.config'
import ServiceBase from '../../libs/serviceBase'
import { setData } from '../../helpers/redis.helpers'
import { generateServerSeedHash } from '../../helpers/encryption.helpers'
import { getProviderUserTokenCacheKey, getUserTokenCacheKey } from '../../utils/user.utils'

const schema = {
  type: 'object',
  properties: {
    userNameOrEmail: { type: 'string' },
    password: { type: 'string' },
    userToken: { type: 'number' }
  },
  required: ['userNameOrEmail', 'password']
}

const constraints = ajv.compile(schema)

/**
 * it provides service of login for a user
 * @export
 * @class LoginService
 * @extends {ServiceBase}
 */
export default class LoginService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    console.log('login service stated ----------> ', new Date().toISOString())
    const userObj = {
      userNameOrEmail: this.args.userNameOrEmail?.toLowerCase?.(),
      password: this.args.password,
      userToken: this.args.userToken
    }

    const { dbModels: { User: UserModel, LoginLog: LoginLogModel, UserLimit: UserLimitModel }, sequelizeTransaction } = this.context
    const whereCondition = {
      [Op.or]: [
        {
          userName: userObj.userNameOrEmail
        },
        {
          email: userObj.userNameOrEmail
        }
      ]
    }
    console.log('login query 1 stated ----------> ', new Date().toISOString())
    const user = await UserModel.findOne({ where: whereCondition, transaction: sequelizeTransaction })
    console.log('login query 1 ended  ----------> ', new Date().toISOString())

    if (!user) return this.addError('UserNotExistsErrorType', `user with email: ${userObj.userNameOrEmail} not found`)

    if (!user.emailVerified) return this.addError('EmailNotVerifiedErrorType', `email: ${userObj.userNameOrEmail} is not verified`)

    if (!user.active) return this.addError('UserNotActiveErrorType', 'User is not active')

    const currentDate = new Date()

    const userLimits = await UserLimitModel.findOne({
      where: {
        userId: user.id
      },
      attributes: ['selfExclusion', 'timeLimit', 'isSelfExclusionPermanent'],
      raw: true,
      transaction: sequelizeTransaction
    })

    if (userLimits?.isSelfExclusionPermanent || currentDate < userLimits?.selfExclusion) {
      return this.addError('AccountDisableErrorType')
    }

    if (!(await bcrypt.compare(userObj.password, user.encryptedPassword))) return this.addError('InvalidCredentialsErrorType', 'Wrong Password')

    user.signInCount += 1

    user.signInIp =
      (this.context.req.headers['x-forwarded-for'] || '').split(',')[0] ||
      this.context.req.connection.remoteAddress

    user.lastLogin = Date.now()

    await user.save({ transaction: sequelizeTransaction })

    if (user.twoFactorEnabled === true) {
      if (!userObj.userToken) return this.addError('LoginTokenRequireErrorType', 'Required Token')
      const validated = speakeasy.totp.verify({
        secret: user.twoFactorSecretKey,
        encoding: 'base32',
        token: userObj.userToken
      })
      if (!validated) {
        return this.addError('InvalidVerificationTokenErrorType', 'Invalid token')
      }
    }

    const accessToken = await jwt.sign(
      { id: user.id, email: user.email },
      config.get('jwt.loginTokenSecret'),
      { expiresIn: config.get('jwt.loginTokenExpiry') }
    )

    const message = user.twoFactorEnabled ? 'Login Successful with 2fa' : 'User logged in'
    console.log('login query 2 stated ----------> ', new Date().toISOString())
    await LoginLogModel.create(
      {
        userId: user.dataValues.id,
        userName: user.userName,
        loginTime: user.dataValues.lastLogin,
        loginIp: user.dataValues.signInIp,
        vipLevel: user.dataValues.vipLevel,
        deviceType: this.context.req.headers['sec-ch-ua-platform']?.replaceAll('"', '')?.replaceAll("'", ''),
        device: this.context.req.headers['sec-ch-ua']?.split(';')?.[0]?.replaceAll('"', '')?.replaceAll("'", '')
      },
      {
        transaction: sequelizeTransaction
      }
    )
    console.log('login query 2 ended ----------> ', new Date().toISOString())
    // set token in redis
    const cacheTokenKey = getUserTokenCacheKey(user.id)
    setData(cacheTokenKey, accessToken, config.get('jwt.loginTokenExpiry'))

    // set nux game token in redis
    const providerAccessToken = nanoid(16)
    const providerUserCacheTokenKey = getProviderUserTokenCacheKey(user.id)
    setData(providerUserCacheTokenKey, providerAccessToken, config.get('nux_game.token_expiry'))

    // get server seed hash
    const { serverSeedHash } = await generateServerSeedHash(user.id)

    console.log('login service ended ----------> ', new Date().toISOString())

    return { accessToken, serverSeedHash, message, user: user.toJSON(), sessionTimeLimit: userLimits?.timeLimit || null }
  }
}

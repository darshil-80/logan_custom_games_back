import axios from 'axios'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { v4 as uuid } from 'uuid'
import ajv from '../../libs/ajv'
import config from '../../configs/app.config'
import ServiceBase from '../../libs/serviceBase'
import { SALT_ROUNDS, AFFILIATE_STATUS, EMAIL_TEMPLATE_CATEGORY, LOGIN_METHODS, BONUS_TYPES, BONUS_STATUS } from '../../libs/constants'
import CheckSignupLimitService from './checkSignupLimit.service'
// import DistributeRegistrationBonusService from '../bonus/distributeRegistrationBonus.service'
import DistributeRegistrationBonusService from '../bonus/distributeRegistrationBonus.service'

const schema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    password: {
      type: 'string',
      pattern: '(?=.*[A-Z])',
      minLength: 5
    },
    userName: { type: 'string' },
    referrerCode: { type: 'string' },
    referralLink: { type: 'string' },
    affiliatedBy: { type: 'string' }
  },
  required: ['email', 'password', 'userName']
}

const constraints = ajv.compile(schema)

/**
 * Provides service to signup the user
 * @export
 * @class SignupService
 * @extends {ServiceBase}
 */
export default class SignupService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        UserToken: UserTokenModel,
        UserBonus: UserBonusModel,
        CrmTemplate: CrmTemplateModel,
        Bonus: BonusModel,
        RankingLevel: RankingLevelModel,
        Affiliate: AffiliateModel,
        Currency,
        Wallet: WalletModel
      },
      sequelizeTransaction
    } = this.context

    const rankingLevel = await RankingLevelModel.findOne({
      where: { rank: 'Beginner' },
      transaction: sequelizeTransaction
    })
    console.log(">>>>>>>>>>>>>>>>>>>>>>++", rankingLevel)
    const userObj = {
      firstName: this.args.firstName,
      lastName: this.args.lastName,
      email: this.args?.email?.toLowerCase?.(),
      userName: this.args?.userName?.toLowerCase?.(),
      referrerCode: this.args.referrerCode,
      affiliatedBy: this.args.affiliatedBy,
      loginMethod: LOGIN_METHODS.SYSTEM,
      rankingLevel: rankingLevel.id
    }

    const newUserReferalBonusObj = {}

    const whereCondition = {
      [Op.or]: [
        {
          userName: userObj.userName
        },
        {
          email: userObj.email
        }
      ]
    }

    const user = await UserModel.findOne({
      where: whereCondition,
      paranoid: false,
      transaction: sequelizeTransaction
    })

    if (user) {
      return this.addError(
        'UserAlreadyExistsErrorType',
        `email: ${userObj.email} already registered`
      )
    }

    const usersLimit = await CheckSignupLimitService.run({}, {
      ...this.context,
      register: true
    })

    if (usersLimit) {
      return this.addError(
        'RegisteredUsersCountExceededErrorType',
        'There are too many users registered'
      )
    }

    userObj.encryptedPassword = await bcrypt.hash(
      this.args.password,
      SALT_ROUNDS
    )

    const currencies = await Currency.findAll({
      transaction: sequelizeTransaction
    })
    console.log(">>>>>>>>>>>>>>>>>>>>>>", {currencies});
    const wallets = currencies.map((currency) => {
      return {
        amount: '0',
        currencyId: currency.id,
        primary: currency.primary
      }
    })

    userObj.wallets = wallets

    const token = uuid()
    userObj.UserTokens = [
      {
        token: token,
        tokenType: 'email'
      }
    ]

    try {
      if (userObj.referrerCode) {
        const referrerUser = await UserModel.findOne({
          where: { referralCode: userObj.referrerCode },
          paranoid: false,
          transaction: sequelizeTransaction
        })

        if (!referrerUser) {
          return this.addError(
            'InvalidReferralCodeErrorType',
            `User of this referralCode: ${userObj.referrerCode} not found`
          )
        } else {
          const activeReferralBonus = await BonusModel.findOne({
            where: { bonusType: BONUS_TYPES.REFERRAL },
            transaction: sequelizeTransaction
          })

          if (activeReferralBonus) {
            newUserReferalBonusObj.userId = referrerUser.id
            newUserReferalBonusObj.bonusType = BONUS_TYPES.REFERRAL
            newUserReferalBonusObj.status = BONUS_STATUS.ACTIVE
            newUserReferalBonusObj.bonusId = activeReferralBonus.id
            newUserReferalBonusObj.bonusAmount = activeReferralBonus.referralBonusAmount
          }
        }
      }

      if (userObj.affiliatedBy) {
        const affiliate = await AffiliateModel.findOne({
          where: {
            code: userObj.affiliatedBy,
            status: AFFILIATE_STATUS.ACTIVE
          },
          paranoid: false,
          transaction: sequelizeTransaction
        })

        if (!affiliate) {
          return this.addError(
            'InvalidAffiliateCodeErrorType',
            `affiliateCode: ${userObj.affiliatedBy} not found`
          )
        } else {
          userObj.affiliateById = affiliate.id
        }
      }

      const newUser = await UserModel.create(userObj, {
        attributes: { exclude: ['encryptedPassword'] },
        include: [
          {
            model: WalletModel,
            as: 'wallets'
          },
          {
            model: UserTokenModel
          }
        ],
        transaction: sequelizeTransaction
      })

      const { id, email, userName } = newUser

      if (newUserReferalBonusObj.bonusType === BONUS_TYPES.REFERRAL) {
        newUserReferalBonusObj.referredUserId = id
        await UserBonusModel.create(newUserReferalBonusObj, {
          transaction: sequelizeTransaction
        })
      }

      // Welcome aboard email
      const crmTemplate = await CrmTemplateModel.findOne({
        where: { category: EMAIL_TEMPLATE_CATEGORY.WELCOME_AND_VERIFY_EMAIL },
        transaction: sequelizeTransaction
      })

      if (!crmTemplate) {
        this.addError('SomethingWentWrongErrorType', 'Email template not found.')
        return
      }

      const verifyEmailUrl = `${config.get('user_frontend_app_url')}/verify/${id}/${token}`
      const emailData = {
        email,
        verifyEmailUrl,
        appName: config.get('app.appName'),
        name: userName || 'User'
      }

      await axios.post(`${config.get('game_engine_url')}/api/v1/mail/send-mail`, {
        email,
        crmId: crmTemplate.id,
        emailDynamicData: emailData
      })

      const primaryWallet = newUser.wallets.find(wallets => wallets.primary)

      // Distribute welcome bonus
      await DistributeRegistrationBonusService.execute({ userId: newUser.id, userWalletId: primaryWallet.dataValues.id }, this.context)
      return {
        message: 'User Registered'
      }
    } catch (e) {
      console.log(e)
      return this.addError('SomethingWentWrongErrorType', 'Token is not valid')
    }
  }
}

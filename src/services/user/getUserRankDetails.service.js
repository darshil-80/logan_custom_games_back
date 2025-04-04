import ServiceBase from '../../libs/serviceBase'
import { TRANSACTION_STATUS, TRANSACTION_TYPES, EAR_ACTION_TYPE, DEFAULT_GAME_ID, USER_TYPES, BONUS_STATUS } from '../../libs/constants'
import ajv from '../../libs/ajv'
import { Op } from 'sequelize'

const schema = {
  type: 'object',
  properties: {
    userId: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

export default class GetUserRankDetailsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        RankingLevel: RankingLevelModel,
        CasinoTransaction: CasinoTransactionModel,
        Transaction: TransactionModel,
        SportBettingTransaction: SportBettingTransactionModel,
        PaymentTransaction: PaymentTransactionModel,
        CasinoGame: CasinoGameModel,
        GameProvider: GameProviderModel,
        GameCategory: GameCategoryModel,
        LinkedSocialAccount: LinkedSocialAccountModel,
        UserBonus: UserBonusModel
      },
      sequelizeTransaction, sequelize
    } = this.context

    const { userId } = this.args
    let nextRankingLevels

    try {
      const userDetail = await UserModel.findOne({
        where: { id: userId },
        include: [
          {
            model: RankingLevelModel,
            required: false,
            as: 'userRank'
          },
          {
            model: WalletModel,
            as: 'wallets',
            include: [
              { model: CurrencyModel, as: 'currency' }
            ]
          },
          {
            model: LinkedSocialAccountModel,
            required: false,
            as: 'linkedAccounts'
          }],
        attributes: ['createdAt', 'userName', 'id', 'firstName', 'profileImageUrl', 'rankingLevel', 'isPrivate', 'isChatModerator'],
        transaction: sequelizeTransaction
      })

      if (!userDetail) {
        this.addError('UserNotExistsErrorType', `userId ${this.args.userId}`)
        return
      }

      if (userDetail && userDetail.userRank?.id) {
        const currentWagerRequirement = userDetail.userRank.wagerRequirement

        nextRankingLevels = await RankingLevelModel.findAll({
          where: {
            wagerRequirement: {
              [Op.gt]: currentWagerRequirement
            }
          },
          order: [['wagerRequirement', 'ASC']],
          limit: 2,
          transaction: sequelizeTransaction
        })
      }

      // casino
      const totalCasinoBetsAndWins = await CasinoTransactionModel.findOne({
        attributes: [
          [
            sequelize.literal('SUM(CASE WHEN "action_type" = :bet THEN "amount" ELSE 0 END)'),
            'bet'
          ],
          [
            sequelize.literal('SUM(CASE WHEN "action_type" = :win THEN "amount" ELSE 0 END)'),
            'win'
          ]
        ],
        where: {
          actioneeId: userDetail.id
        },
        replacements: {
          bet: EAR_ACTION_TYPE.BET,
          win: EAR_ACTION_TYPE.WIN
        },
        raw: true
      })

      // sportsbook
      const totalSportsBookBetsAndWins = await SportBettingTransactionModel.findOne({
        attributes: [
          [
            sequelize.literal('SUM(CASE WHEN "action_type" = :bet THEN "amount" ELSE 0 END)'),
            'bet'
          ],
          [
            sequelize.literal('SUM(CASE WHEN "action_type" = :win THEN "amount" ELSE 0 END)'),
            'win'
          ]
        ],
        where: {
          actioneeId: userDetail.id
        },
        replacements: {
          bet: TRANSACTION_TYPES.BET,
          win: TRANSACTION_TYPES.WIN
        },
        raw: true,
        transaction: sequelizeTransaction
      })

      // Custom
      const totalCustomBetsAndWins = await TransactionModel.findOne({
        attributes: [
          [
            sequelize.literal('SUM(CASE WHEN "transaction_type" = :bet THEN "amount" ELSE 0 END)'),
            'bet'
          ],
          [
            sequelize.literal('SUM(CASE WHEN "transaction_type" = :win THEN "amount" ELSE 0 END)'),
            'win'
          ]
        ],
        where: {
          actioneeId: userDetail.id,
          gameId: { [Op.notIn]: [DEFAULT_GAME_ID.CRYPTO_FUTURES] }
        },
        replacements: {
          bet: TRANSACTION_TYPES.BET,
          win: TRANSACTION_TYPES.WIN
        },
        raw: true,
        transaction: sequelizeTransaction
      })

      const totalDepositAmount = await PaymentTransactionModel.sum('amount', {
        where: {
          actioneeId: userDetail.id,
          transactionType: TRANSACTION_TYPES.DEPOSIT,
          status: TRANSACTION_STATUS.SUCCESS
        }
      }, { transaction: sequelizeTransaction }) || 0

      const cryptoTrades = await TransactionModel.sum('amount', {
        where: {
          actioneeType: USER_TYPES.USER,
          transactionType: TRANSACTION_TYPES.BET,
          gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES,
          status: TRANSACTION_STATUS.SUCCESS
        },
        transaction: sequelizeTransaction
      })

      const favGames = await CasinoTransactionModel.findAll({
        attributes: ['casinoGameId', [sequelize.fn('COUNT', sequelize.col('casino_game_id')), 'count']],
        where: { actionType: 'casino-bet', actioneeId: userDetail.id },
        group: ['casinoGameId'],
        order: [[sequelize.literal('count DESC')]],
        limit: 3
      })

      const casinoGameIds = favGames.map(favGame => favGame.casinoGameId)

      let mostPlayedGameDetails = null
      if (favGames[0]) {
        mostPlayedGameDetails = await CasinoGameModel.findAll({
          where: { earGameId: casinoGameIds },
          include: [
            {
              model: GameProviderModel,
              attributes: ['providerId', 'name', 'status']
            },
            {
              model: GameCategoryModel,
              as: 'gameCategory',
              attributes: ['gameCategory', 'status', 'image']
            }
          ]
        })
      }

      const totalBonus = (await UserBonusModel.sum('bonus_amount', {
        where: {
          userId: userDetail.id,
          status: BONUS_STATUS.CLAIMED
        },
        transaction: sequelizeTransaction
      })) || 0

      const totalBets = totalCasinoBetsAndWins.bet + totalCustomBetsAndWins.bet + totalSportsBookBetsAndWins.bet
      const userWagerAmount = totalBets
      const totalRewards = totalBonus
      const joinedDate = userDetail.createdAt
      const name = userDetail.userName
      const customBets = totalCustomBetsAndWins.bet
      const casinoBets = totalCasinoBetsAndWins.bet
      const sportsBets = totalSportsBookBetsAndWins.bet

      return { cryptoTrades, customBets, casinoBets, sportsBets, totalBets, totalRewards, joinedDate, totalDepositAmount, userWagerAmount, name, id: userDetail.id, profileImageUrl: userDetail.profileImageUrl, mostPlayedGameDetails, userRankDetails: userDetail.userRank, nextRankingDetails: nextRankingLevels, isPrivate: userDetail.isPrivate, linkedAccounts: userDetail.linkedAccounts, isChatModerator: userDetail.isChatModerator }
    } catch (error) {
      return this.addError('SomethingWentWrongErrorType', error.message)
    }
  }
}

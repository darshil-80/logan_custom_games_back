import { Op } from 'sequelize'
import { sequelize } from '../../db/models'
import ServiceBase from '../../libs/serviceBase'

/**
 * Provides service to show user details
 * @export
 * @class GetUserDetailService
 * @extends {ServiceBase}
 */
export default class GetReferralUserService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        User: UserModel,
        CasinoTransaction: CasinoTransactionModel,
        SportBettingTransaction: SportBettingTransactionModel,
        Transaction: TransactionModel
      },
      sequelizeTransaction
    } = this.context

    const user = await UserModel.findOne({
      where: {
        id: this.context.auth.id,
        referralCode: {
          [Op.ne]: null
        }
      },
      transaction: sequelizeTransaction
    })

    if (!user) return { message: 'No referrer user found' }

    const referralUser = await UserModel.findAll({
      where: {
        referrerCode: user.referralCode
      },
      attributes: [
        'id', 'userName', 'email', 'active', 'createdAt', 'referralCode', 'referrerCode', 'referralLink',
        [
          sequelize.literal('sum(case when "casinoTransactions"."action_type" = \'casino-bet\' then "casinoTransactions"."amount" else 0 end)'),
          'totalCasinoBet'
        ],
        [
          sequelize.literal('sum(case when "casinoTransactions"."action_type" = \'casino-win\' then "casinoTransactions"."amount" else 0 end)'),
          'totalCasinoWin'
        ],
        [
          sequelize.literal('sum(case when "transactions"."transaction_type" = \'bet\' then "transactions"."amount" else 0 end)'),
          'totalCustomBet'
        ],
        [
          sequelize.literal('sum(case when "transactions"."transaction_type" = \'win\' then "transactions"."amount" else 0 end)'),
          'totalCustomWin'
        ],
        [
          sequelize.literal('sum(case when "sportBettingTransactions"."transaction_type" = \'credit\' then "sportBettingTransactions"."amount" else 0 end)'),
          'totalSportsWin'
        ],
        [
          sequelize.literal('sum(case when "sportBettingTransactions"."transaction_type" = \'debit\' then "sportBettingTransactions"."amount" else 0 end)'),
          'totalSportsBet'
        ]
      ],
      include: [
        {
          model: CasinoTransactionModel,
          as: 'casinoTransactions',
          attributes: []
        },
        {
          model: SportBettingTransactionModel,
          as: 'sportBettingTransactions',
          attributes: []
        },
        {
          model: TransactionModel,
          as: 'transactions',
          attributes: []
        }
      ],
      group: ['User.id'],
      order: [['id', 'ASC']],
      transaction: sequelizeTransaction
    })

    return referralUser
  }
}

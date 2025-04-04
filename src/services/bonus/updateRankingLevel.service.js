import { plus } from 'number-precision'
import { EAR_ACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import Sequelize, { Op } from 'sequelize'
import RankingLevelEmitter from '../../socket-resources/emitters/rankingLevel.emitter'
/**
 * Provides service to update ranking level of user every 24 hours
 * @export
 * @class UpdateRankingLevelService
 * @extends {ServiceBase}
 */
export default class UpdateRankingLevelService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        User: UserModel,
        Transaction: TransactionModel,
        CasinoTransaction: CasinoTransactionModel,
        SportBettingTransaction: SportBettingTransactionModel,
        RankingLevel: RankingLevelModel
      },
      sequelizeTransaction
    } = this.context

    const { userId } = this.args

    const user = await UserModel.findOne({
      where: {
        id: userId
      },
      transaction: sequelizeTransaction
    })

    if (!user) {
      return { message: 'There is no active users' }
    }

    const totalCustomBet = (await TransactionModel.sum('amount', {
      where: {
        actionee_id: user.id,
        transactionType: TRANSACTION_TYPES.BET,
        status: TRANSACTION_STATUS.SUCCESS
      },
      transaction: sequelizeTransaction
    })) || 0

    const totalCasinoBet = (await CasinoTransactionModel.sum('amount', {
      where: {
        actionee_id: user.id,
        transactionType: EAR_ACTION_TYPE.DEBIT
      },
      transaction: sequelizeTransaction
    })) || 0

    const totalSportBookBet = (await SportBettingTransactionModel.sum('amount', {
      where: {
        actionee_id: user.id,
        actionType: TRANSACTION_TYPES.BET
      },
      transaction: sequelizeTransaction
    })) || 0

    const wagerAmount = plus(totalCustomBet, totalCasinoBet, totalSportBookBet)

    const rankingDetail = await RankingLevelModel.findOne({
      attributes: ['id', 'wagerRequirement', 'rank', 'status', 'description', 'imageLogo', 'moreDetails'],
      where: {
        wagerRequirement: {
          [Op.lte]: wagerAmount
        }
      },
      order: [
        [Sequelize.literal('ABS("wager_requirement" - ' + wagerAmount + ')'), 'ASC']
      ],
      limit: 1
    })

    if (user.rankingLevel !== rankingDetail.id) {
      await UserModel.update({
        rankingLevel: rankingDetail.id
      }, {
        where: {
          id: user.id
        },
        transaction: sequelizeTransaction
      })
      RankingLevelEmitter.emitUserRankingLevel(rankingDetail, userId)
    }

    return { message: 'Ranking Level Updated' }
  }
}

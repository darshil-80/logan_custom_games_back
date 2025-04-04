import ajv from '../../../libs/ajv'
import ServiceBase from '../../../libs/serviceBase'
import { TOP_BET_TYPE, BET_RESULT, CRASH_GAME_STATE } from '../../../libs/constants'
import { Sequelize } from '../../../db/models'

const schema = {
  type: 'object',
  properties: {
    limit: { type: 'string', default: '10' },
    offset: { type: 'string', default: '0' },
    type: { type: 'string', enum: [TOP_BET_TYPE.BIGGEST_WIN, TOP_BET_TYPE.HUGE_WIN, TOP_BET_TYPE.MULTIPLIER] }
  }
}

const constraints = ajv.compile(schema)

/**
 * @export
 * @class CrashGameGetHighRollerBetsService
 * @extends {ServiceBase}
 */
export default class CrashGameGetHighRollerBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        CrashGameBet: CrashGameBetModel,
        User: UserModel,
        CrashGameRoundDetail: CrashGameRoundDetailModel
      },
      sequelizeTransaction
    } = this.context

    let orderBy = []

    if (TOP_BET_TYPE.HUGE_WIN === this.args.type) {
      orderBy = ['winningAmount', 'DESC']
    } else if (TOP_BET_TYPE.MULTIPLIER === this.args.type) {
      orderBy = ['escapeRate', 'DESC']
    } else {
      orderBy = [Sequelize.literal('profit'), 'DESC']
    }

    const crashGameBets = await CrashGameBetModel.findAndCountAll({
      where: {
        result: {
          [Sequelize.Op.ne]: BET_RESULT.CANCELLED
        }
      },
      attributes: ['id', 'autoRate', 'escapeRate', 'betAmount', 'winningAmount', 'result', 'currencyId', [Sequelize.literal(`(
        sum(coalesce("winning_amount", 0)) -  sum(coalesce("bet_amount", 0))
      )`),
      'profit']],
      order: [orderBy],
      limit: this.args.limit,
      offset: this.args.offset,
      transaction: sequelizeTransaction,
      include: [
        {
          model: UserModel,
          as: 'user',
          attributes: ['firstName', 'lastName', 'userName', 'ethereumAddress']
        },
        {
          model: CrashGameRoundDetailModel,
          as: 'crashGameRoundDetail',
          where: { roundState: CRASH_GAME_STATE.STOPPED },
          requird: true
        }
      ],
      group: ['CrashGameBet.id', 'user.id', 'crashGameRoundDetail.id']
    })

    return {
      count: crashGameBets.count.length,
      rows: crashGameBets.rows.map(bet => bet?.toJSON()) || []
    }
  }
}

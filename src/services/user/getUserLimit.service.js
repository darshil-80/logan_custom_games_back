import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'
import { TRANSACTION_TYPES, DATE_OPTION } from '../../libs/constants'
import { getTotalBetOrWin, getTotalDeposit } from '../../utils/transactions.utils'

const schema = {
  type: 'object',
  properties: {
    userId: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

export default class GetUserLimitService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        UserLimit: UserLimitModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    try {
      const getLimits = await UserLimitModel.findOne({
        where: { userId }
      }, { transaction: sequelizeTransaction })

      if (!getLimits) return { message: 'No Limit Found' }

      getLimits.dataValues.todayTotalBet = await getTotalBetOrWin(DATE_OPTION.DAY, TRANSACTION_TYPES.BET, userId)
      getLimits.dataValues.weekTotalBet = await getTotalBetOrWin(DATE_OPTION.WEEK, TRANSACTION_TYPES.BET, userId)
      getLimits.dataValues.monthTotalBet = await getTotalBetOrWin(DATE_OPTION.MONTH, TRANSACTION_TYPES.BET, userId)

      getLimits.dataValues.todayTotalWin = await getTotalBetOrWin(DATE_OPTION.DAY, TRANSACTION_TYPES.WIN, userId)
      getLimits.dataValues.weekTotalWin = await getTotalBetOrWin(DATE_OPTION.WEEK, TRANSACTION_TYPES.WIN, userId)
      getLimits.dataValues.monthTotalWin = await getTotalBetOrWin(DATE_OPTION.MONTH, TRANSACTION_TYPES.WIN, userId)

      getLimits.dataValues.todayTotalLoss = getLimits.dataValues.todayTotalBet - getLimits.dataValues.todayTotalWin
      getLimits.dataValues.weekTotalLoss = getLimits.dataValues.weekTotalBet - getLimits.dataValues.weekTotalWin
      getLimits.dataValues.monthTotalLoss = getLimits.dataValues.monthTotalBet - getLimits.dataValues.monthTotalWin

      getLimits.dataValues.todayTotalDeposit = await getTotalDeposit(DATE_OPTION.DAY, TRANSACTION_TYPES.DEPOSIT, userId)
      getLimits.dataValues.weekTotalDeposit = await getTotalDeposit(DATE_OPTION.WEEK, TRANSACTION_TYPES.DEPOSIT, userId)
      getLimits.dataValues.monthTotalDeposit = await getTotalDeposit(DATE_OPTION.MONTH, TRANSACTION_TYPES.DEPOSIT, userId)
      return { getLimits, message: 'Successful' }
    } catch (error) {
      this.addError('InternalServerErrorType', error)
    }
  }
}

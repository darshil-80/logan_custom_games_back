import { Op } from 'sequelize'
import moment from 'moment'
import ajv from '../../libs/ajv'
import { AFFILIATE_STATUS, EAR_ACTION_TYPE, SETTLEMENT_STATUS, TRANSACTION_STATUS, TRANSACTION_TYPES } from '../../libs/constants'
import ServiceBase from '../../libs/serviceBase'
import _ from 'lodash'

const schema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  }
}

const constraints = ajv.compile(schema)

/**
 * Provides service to show associated users stats of given affiliate code
 * @export
 * @class GetAffiliateStatsService
 * @extends {ServiceBase}
 */
export default class GetAffiliateStatsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      dbModels: {
        User: UserModel,
        Affiliate: AffiliateModel,
        AffiliateSettlement: AffiliateSettlementModel,
        AffiliateCommisionSetting: AffiliateCommisionSettingModel,
        PaymentTransaction: PaymentTransactionModel,
        Transaction: TransactionModel,
        CasinoTransaction: CasinoTransactionModel,
        SportBettingTransaction: SportBettingTransactionModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const { startDate, endDate } = this.args

    const affiliate = await AffiliateModel.findOne({
      where: {
        ownerId: userId,
        status: AFFILIATE_STATUS.ACTIVE
      },
      transaction: sequelizeTransaction
    })

    if (!affiliate) {
      return { message: 'No referral user found' }
    }
    const whereCondition = {
      ...((startDate && endDate)
        ? { createdAt: { [Op.between]: [moment(startDate).startOf('day'), moment(endDate).endOf('day')] } }
        : {})
    }

    const filterTransaction = _.omitBy(whereCondition, _.isNil)

    const affiliatesPendingCommision = await AffiliateSettlementModel.sum('profit_commision_amount', {
      where: {
        status: SETTLEMENT_STATUS.PENDING,
        affiliateId: affiliate.id
      },
      transaction: sequelizeTransaction
    }) || 0

    const affiliatesProfitCommision = (await AffiliateSettlementModel.sum('profit_commision_amount', {
      where: {
        status: SETTLEMENT_STATUS.COMPLETED,
        affiliateId: affiliate.id
      },
      transaction: sequelizeTransaction
    })) || 0

    const totalDepositAmount = await PaymentTransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        transactionType: TRANSACTION_TYPES.DEPOSIT,
        status: TRANSACTION_STATUS.SUCCESS
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'source'
      }],
      group: ['source.id'],
      transaction: sequelizeTransaction
    })

    const totalWithdrawAmount = await PaymentTransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        transactionType: TRANSACTION_TYPES.WITHDRAW,
        status: TRANSACTION_STATUS.SUCCESS
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'source'
      }],
      group: ['source.id'],
      transaction: sequelizeTransaction
    })

    const totalCustomWin = await TransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        transactionType: TRANSACTION_TYPES.WIN,
        status: TRANSACTION_STATUS.SUCCESS
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'user'
      }],
      group: ['user.id'],
      transaction: sequelizeTransaction
    })

    const totalCustomBet = await TransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        transactionType: TRANSACTION_TYPES.BET,
        status: TRANSACTION_STATUS.SUCCESS
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'user'
      }],
      group: ['user.id'],
      transaction: sequelizeTransaction
    })

    const totalCasinoBet = await CasinoTransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        transactionType: EAR_ACTION_TYPE.DEBIT
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'user'
      }],
      group: ['user.id'],
      transaction: sequelizeTransaction
    })

    const totalCasinoWin = await CasinoTransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        transactionType: EAR_ACTION_TYPE.CREDIT
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'user'
      }],
      group: ['user.id'],
      transaction: sequelizeTransaction
    })

    const totalSportBookBet = await SportBettingTransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        actionType: TRANSACTION_TYPES.BET
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'user'
      }],
      group: ['user.id'],
      transaction: sequelizeTransaction
    })

    const totalSportBookWin = await SportBettingTransactionModel.sum('amount', {
      where: {
        ...filterTransaction,
        actionType: TRANSACTION_TYPES.WIN
      },
      include: [{
        model: UserModel,
        where: { affiliatedBy: affiliate.code },
        attributes: ['id', 'userName', 'email', 'active'],
        as: 'user'
      }],
      group: ['user.id'],
      transaction: sequelizeTransaction
    })

    const totalWin = totalCasinoWin + totalSportBookWin + totalCustomWin
    const totalWagering = totalCustomBet + totalSportBookBet + totalCasinoBet
    const totalSystemProfit = totalWagering - totalWin

    const commisionSettingsInfo = await AffiliateCommisionSettingModel.findOne({
      where: {
        affiliateId: affiliate.id
      },
      transaction: sequelizeTransaction
    })

    if (!commisionSettingsInfo) {
      return 'Commision settings is not set for affiliates'
    }

    const affiliatesWageredCommision = (commisionSettingsInfo.wageredCommisionPercentage / 100) * totalWagering

    return {
      totalWin,
      totalWagering,
      totalSystemProfit,
      affiliatesPendingCommision,
      affiliatesProfitCommision,
      affiliatesWageredCommision,
      totalDepositAmount,
      totalWithdrawAmount
    }
  }
}

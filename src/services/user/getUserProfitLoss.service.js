import ServiceBase from '../../libs/serviceBase'
import { Op } from 'sequelize'
import { TRANSACTION_STATUS, TRANSACTION_TYPES, EAR_ACTION_TYPE, EAR_TRANSACTION_TYPE, USER_TYPES, DEFAULT_GAME_ID } from '../../libs/constants'

export default class GetUserProfitLossService extends ServiceBase {
  async run () {
    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        CasinoTransaction: CasinoTransactionModel,
        Transaction: TransactionModel,
        SportBettingTransaction: SportBettingTransactionModel
      },
      sequelizeTransaction
    } = this.context

    const userDetail = await UserModel.findOne({
      where: { id: this.context.auth.id },
      include: [{
        model: WalletModel,
        as: 'wallets',
        include: [{ model: CurrencyModel, as: 'currency' }]
      }],
      attributes: [],
      transaction: sequelizeTransaction
    })

    if (!userDetail) {
      this.addError('UserNotExistsErrorType', `userId ${this.args.userId}`)
      return
    }

    const totalCustomWin = await TransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        transactionType: TRANSACTION_TYPES.WIN,
        status: TRANSACTION_STATUS.SUCCESS
      },
      transaction: sequelizeTransaction
    })

    const customBets = await TransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        gameId: { [Op.notIn]: [DEFAULT_GAME_ID.CRYPTO_FUTURES] },
        transactionType: TRANSACTION_TYPES.BET,
        status: TRANSACTION_STATUS.SUCCESS
      },
      transaction: sequelizeTransaction
    })

    const casinoBets = await CasinoTransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        transactionType: EAR_TRANSACTION_TYPE.DEBIT,
        actionType: EAR_ACTION_TYPE.BET
      },
      transaction: sequelizeTransaction
    })

    const totalCasinoWin = await CasinoTransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        transactionType: EAR_TRANSACTION_TYPE.CREDIT,
        actionType: EAR_ACTION_TYPE.WIN
      },
      transaction: sequelizeTransaction
    })

    const sportBets = await SportBettingTransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        actionType: TRANSACTION_TYPES.BET
      },
      transaction: sequelizeTransaction
    })

    const totalSportBookWin = await SportBettingTransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        actionType: TRANSACTION_TYPES.WIN
      },
      transaction: sequelizeTransaction
    })

    const cryptoTrades = await TransactionModel.sum('amount', {
      where: {
        actioneeId: this.context.auth.id,
        actioneeType: USER_TYPES.USER,
        transactionType: TRANSACTION_TYPES.BET,
        gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES,
        status: TRANSACTION_STATUS.SUCCESS
      },
      transaction: sequelizeTransaction
    })

    return { casinoBets, totalCasinoWin, customBets, totalCustomWin, sportBets, totalSportBookWin, cryptoTrades }
  }
}

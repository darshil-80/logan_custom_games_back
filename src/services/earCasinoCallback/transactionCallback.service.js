import ajv from '../../libs/ajv'
import { v4 as uuidv4 } from 'uuid'
import { EAR_ACTION_TYPE, EAR_TRANSACTION_TYPE, USER_TYPES, DATE_OPTION, LIMIT_EXCEED_MESSAGE, TRANSACTION_TYPES } from '../../libs/constants'
import { EAR_ERROR_CODES } from '../../libs/earErrorCodes'
import ServiceBase from '../../libs/serviceBase'
import WalletEmitter from '../../socket-resources/emitters/wallet.emitter'
import LiveWinsEmitter from '../../socket-resources/emitters/liveWins.emitter'
import { getTotalBetOrWin } from '../../utils/transactions.utils'
import UpdateRankingLevelService from '../bonus/updateRankingLevel.service'
import HandleBonusWageringService from '../bonus/handleBonusWagering.service'
import Logger from '../../libs/logger'

const schema = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    bonus_amount: { type: 'number' },
    user_id: { type: 'number' },
    type: { type: 'number', enum: [0, 1, 2, 3] },
    type_code: { type: 'string', enum: ['casino-bet', 'casino-win', 'casino-refund', 'casino-bonus-bet', 'casino-bonus-credit', 'casino-bonus-refund'] },
    payload: { type: 'object' },
    provider_transfer_data: { type: 'object' },
    currency_code: { type: 'string' }
  },
  required: ['user_id']
}

const constraints = ajv.compile(schema)
/**
 * Callback for transaction for ear casino
 * @export
 * @class TransactionCallbackService
 * @extends {ServiceBase}
 */

export default class TransactionCallbackService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const {
      amount,
      bonus_amount: bonusAmount,
      user_id: userId,
      type,
      type_code: typeCode,
      // currency_code: currency,
      payload,
      provider_transfer_data: providerTransferData
    } = this.args

    console.log('this.args------------------', this.args)
    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        CasinoGame: CasinoGameModel,
        CasinoTransaction: CasinoTransactionModel,
        UserLimit: UserLimitModel
      },
      sequelizeTransaction
    } = this.context

    const user = await UserModel.findOne({
      where: {
        id: userId
      },
      include:
        [{
          model: WalletModel,
          required: false,
          as: 'wallets',
          include: [
            {
              model: CurrencyModel,
              required: false,
              as: 'currency'
            }
          ]
        }],
      transaction: sequelizeTransaction
    })

    const responseObject = {}
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null
    console.log('userWallet------------------', userWallet)
    let balance = userWallet.amount
    let beforeBalance
    let isNonCashAmount = false

    if (!userWallet) {
      responseObject.statusCode = EAR_ERROR_CODES.UNKNOWN_ERROR
      responseObject.status = false
      responseObject.errors = {
        code: EAR_ERROR_CODES.UNKNOWN_ERROR,
        error: 'user wallet not found'
      }
      return responseObject
    }

    if (!user.active) {
      responseObject.statusCode = EAR_ERROR_CODES.USER_BLOCKED
      responseObject.status = false
      responseObject.errors = {
        code: EAR_ERROR_CODES.USER_BLOCKED,
        error: `user not active with userId ${userId}`
      }
      return responseObject
    }

    if (typeCode === EAR_ACTION_TYPE.BET || typeCode === EAR_ACTION_TYPE.BONUS_BET) {
      if (+userWallet.nonCashAmount >= amount) {
        balance = userWallet.nonCashAmount
        isNonCashAmount = true
      }

      const checkLimitExist = await UserLimitModel.findOne({
        where: { userId },
        attributes: ['dailyBetLimit', 'weeklyBetLimit', 'monthlyBetLimit', 'dailyLossLimit', 'weeklyLossLimit', 'monthlyLossLimit'],
        raw: true,
        transaction: sequelizeTransaction
      })

      console.log('checkLimitExist------------------', checkLimitExist)

      const todayBet = await getTotalBetOrWin(DATE_OPTION.DAY, TRANSACTION_TYPES.BET, userId)
      const weekBet = await getTotalBetOrWin(DATE_OPTION.WEEK, TRANSACTION_TYPES.BET, userId)
      const monthBet = await getTotalBetOrWin(DATE_OPTION.MONTH, TRANSACTION_TYPES.BET, userId)

      const todayWin = await getTotalBetOrWin(DATE_OPTION.DAY, TRANSACTION_TYPES.WIN, userId)
      const weekWin = await getTotalBetOrWin(DATE_OPTION.WEEK, TRANSACTION_TYPES.WIN, userId)
      const monthWin = await getTotalBetOrWin(DATE_OPTION.MONTH, TRANSACTION_TYPES.WIN, userId)

      const todayLoss = todayBet - todayWin
      const weekLoss = weekBet - weekWin
      const monthLoss = monthBet - monthWin

      const todayRemainingLimit = checkLimitExist?.dailyBetLimit - todayBet
      const weekRemainingLimit = checkLimitExist?.weeklyBetLimit - weekBet
      const monthRemainingLimit = checkLimitExist?.monthlyBetLimit - monthWin

      const todayRemainingLossLimit = checkLimitExist?.dailyLossLimit - todayLoss
      const weekRemainingLossLimit = checkLimitExist?.weeklyLossLimit - weekLoss
      const monthRemainingLossLimit = checkLimitExist?.monthlyLossLimit - monthLoss

      if (todayRemainingLimit > 0 || weekRemainingLimit > 0 || monthRemainingLimit > 0 || todayRemainingLossLimit > 0 || weekRemainingLossLimit > 0 || monthRemainingLossLimit > 0) {
        if (todayRemainingLimit > 0 && todayRemainingLimit < amount) {
          responseObject.errors = {
            code: EAR_ERROR_CODES.INTERNAL_ERROR,
            message: LIMIT_EXCEED_MESSAGE.DAILY_BET
          }
          return responseObject
        } else if (weekRemainingLimit > 0 && weekRemainingLimit < amount) {
          responseObject.errors = {
            code: EAR_ERROR_CODES.INTERNAL_ERROR,
            message: LIMIT_EXCEED_MESSAGE.WEEKLY_BET
          }
          return responseObject
        } else if (monthRemainingLimit > 0 && monthRemainingLimit < amount) {
          responseObject.errors = {
            code: EAR_ERROR_CODES.INTERNAL_ERROR,
            message: LIMIT_EXCEED_MESSAGE.MONTHLY_BET
          }
          return responseObject
        } else if (todayRemainingLossLimit > 0 && todayRemainingLossLimit < amount) {
          responseObject.errors = {
            code: EAR_ERROR_CODES.INTERNAL_ERROR,
            message: LIMIT_EXCEED_MESSAGE.DAILY_LOSS
          }
          return responseObject
        } else if (weekRemainingLossLimit > 0 && weekRemainingLossLimit < amount) {
          responseObject.errors = {
            code: EAR_ERROR_CODES.INTERNAL_ERROR,
            message: LIMIT_EXCEED_MESSAGE.WEEKLY_LOSS
          }
          return responseObject
        } else if (monthRemainingLossLimit > 0 && monthRemainingLossLimit < amount) {
          responseObject.errors = {
            code: EAR_ERROR_CODES.INTERNAL_ERROR,
            message: LIMIT_EXCEED_MESSAGE.MONTHLY_LOSS
          }
          return responseObject
        }
      }

      if (checkLimitExist && checkLimitExist.dailyBetLimit && checkLimitExist.dailyBetLimit <= todayBet) {
        responseObject.errors = {
          code: EAR_ERROR_CODES.INTERNAL_ERROR,
          error: LIMIT_EXCEED_MESSAGE.DAILY_BET
        }
        return responseObject
      } else if (checkLimitExist && checkLimitExist.weeklyBetLimit && checkLimitExist.weeklyBetLimit <= weekBet) {
        responseObject.errors = {
          code: EAR_ERROR_CODES.INTERNAL_ERROR,
          error: LIMIT_EXCEED_MESSAGE.WEEKLY_BET
        }
        return responseObject
      } else if (checkLimitExist && checkLimitExist.monthlyBetLimit && checkLimitExist.monthlyBetLimit <= monthBet) {
        responseObject.errors = {
          code: EAR_ERROR_CODES.INTERNAL_ERROR,
          error: LIMIT_EXCEED_MESSAGE.MONTHLY_BET
        }
        return responseObject
      } else if (checkLimitExist && checkLimitExist.dailyLossLimit && checkLimitExist.dailyLossLimit <= todayLoss) {
        responseObject.errors = {
          code: EAR_ERROR_CODES.INTERNAL_ERROR,
          error: LIMIT_EXCEED_MESSAGE.DAILY_LOSS
        }
        return responseObject
      } else if (checkLimitExist && checkLimitExist.WeeklyLossLimit && checkLimitExist.WeeklyLossLimit <= weekLoss) {
        responseObject.errors = {
          code: EAR_ERROR_CODES.INTERNAL_ERROR,
          error: LIMIT_EXCEED_MESSAGE.WEEKLY_LOSS
        }
        return responseObject
      } else if (checkLimitExist && checkLimitExist.monthlyLossLimit && checkLimitExist.monthlyLossLimit <= monthLoss) {
        responseObject.errors = {
          code: EAR_ERROR_CODES.INTERNAL_ERROR,
          error: LIMIT_EXCEED_MESSAGE.MONTHLY_LOSS
        }
        return responseObject
      }
    }

    // if ((typeCode === EAR_ACTION_TYPE.BET || typeCode === EAR_ACTION_TYPE.BONUS_BET) && (typeCode === EAR_ACTION_TYPE.BET ? userWallet.amount < amount : userWallet.amount < bonusAmount)) {
    if ((typeCode === EAR_ACTION_TYPE.BET || typeCode === EAR_ACTION_TYPE.BONUS_BET) && (userWallet.amount < amount || userWallet.amount < bonusAmount) && (userWallet.nonCashAmount < amount || userWallet.nonCashAmount < bonusAmount)) {
      console.log('Insufficient Balance error logs-----------------------------------------------------')
      responseObject.statusCode = EAR_ERROR_CODES.INTERNAL_ERROR
      responseObject.errors = {
        code: EAR_ERROR_CODES.INTERNAL_ERROR,
        error: 'Insufficient Balance'
      }
      return responseObject
    }

    const checkGameExist = await CasinoGameModel.findOne({
      where: {
        earGameId: (payload.game_id)
      }
    })

    console.log('checkGameExist-------------------', checkGameExist)

    if (!checkGameExist) {
      responseObject.statusCode = EAR_ERROR_CODES.INTERNAL_ERROR
      responseObject.errors = {
        code: EAR_ERROR_CODES.INTERNAL_ERROR,
        error: 'game not exist'
      }
    }

    let transactionExists = null
    let transactionType
    let totalRoundTransaction = 0

    if (providerTransferData.transaction_id) {
      transactionExists = await CasinoTransactionModel.findOne({
        where: { transactionId: providerTransferData.transaction_id }
      }, { transaction: sequelizeTransaction })
    }

    if (transactionExists) {
      responseObject.statusCode = EAR_ERROR_CODES.INTERNAL_ERROR
      responseObject.errors = {
        code: EAR_ERROR_CODES.INTERNAL_ERROR,
        error: 'transaction for this ID already exist'
      }
      return responseObject
    }

    try {
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      if (type) {
        if (type === 1) {
          transactionType = EAR_TRANSACTION_TYPE.CREDIT
          balance += parseFloat(amount)
          beforeBalance = balance - amount
          // bonusBalance += parseFloat(bonusAmount)
        } else if (type === 3) {
          transactionType = EAR_TRANSACTION_TYPE.REFUND
          balance += parseFloat(amount)
          beforeBalance = balance - amount
          // bonusBalance += parseFloat(bonusAmount)
        } else {
          transactionType = EAR_TRANSACTION_TYPE.FREE_GAME
        }
      } else {
        transactionType = EAR_TRANSACTION_TYPE.DEBIT
        balance -= parseFloat(amount)
        beforeBalance = balance + amount
        // bonusBalance -= parseFloat(bonusAmount)
      }
      let query
      let isNonCash = false
      if (isNonCashAmount) {
        query = { nonCashAmount: balance }
        isNonCash = true
      } else {
        query = { amount: balance }
      }
      // await userWallet.set({ amount: balance.toFixed(2), nonCashAmount: bonusBalance.toFixed(2) }).save({ transaction: sequelizeTransaction })
      await userWallet.set(query).save({ transaction: sequelizeTransaction })

      if (!amount && typeCode === EAR_ACTION_TYPE.WIN) {
        const roundTransactions = await CasinoTransactionModel.findAndCountAll({
          where: {
            transactionInfo: {
              round_id: providerTransferData.round_id
            }
          }
        })
        totalRoundTransaction = roundTransactions.count
      }

      const createTransaction = await CasinoTransactionModel.create({
        actioneeId: user.id,
        actioneeType: USER_TYPES.USER,
        currencyId: userWallet.currency.id,
        gameId: checkGameExist.id,
        extraData: payload,
        time: new Date(),
        casinoGameId: payload.game_id,
        currencyCode: userWallet.currency.code,
        transactionType: transactionType,
        transactionId: providerTransferData.transaction_id,
        actionType: typeCode,
        transactionInfo: providerTransferData,
        amount: (amount),
        beforeBalance,
        afterBalance: balance,
        nonCashAmount: bonusAmount,
        isNonCashAmount: isNonCash
      }, { transaction: sequelizeTransaction })

      console.log('createTransaction-------------------------------', createTransaction)
      responseObject.transaction_id = createTransaction.id
      responseObject.status = 'authorized'
      responseObject.balance = balance.toFixed(2)
      responseObject.balance_bonus = 0

      await HandleBonusWageringService.execute({ userId, userWalletId: userWallet.id, betAmount: +amount }, this.context)

      await UpdateRankingLevelService.execute({ userId }, this.context)

      Logger.info('EAR Transaction callback: START ::')
      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      Logger.info('EAR Transaction callback: END ::')
      if (totalRoundTransaction < 2) {
        LiveWinsEmitter.emitLiveWins(
          {
            id: uuidv4(),
            amount: (amount) || bonusAmount,
            casinoGameId: checkGameExist.id,
            title: checkGameExist.title,
            image: checkGameExist.image,
            time: createTransaction.time,
            type: typeCode,
            roundId: providerTransferData.round_id,
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              userName: user.userName
            }
          }
        )
      }

      await sequelizeTransaction.commit()
      return responseObject
    } catch (error) {
      console.log('------------------------', error)
      await sequelizeTransaction.rollback()
      responseObject.statusCode = EAR_ERROR_CODES.INTERNAL_ERROR
      responseObject.errors = {
        code: EAR_ERROR_CODES.INTERNAL_ERROR
      }

      return { error, responseObject }
    }
  }
}

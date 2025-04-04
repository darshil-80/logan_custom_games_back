import db from '../db/models'
import { TRANSACTION_STATUS, TRANSACTION_TYPES, EAR_ACTION_TYPE, EAR_TRANSACTION_TYPE, DATE_OPTION } from '../libs/constants'
import { dateOptionsFilter, getWeeklyFilter, getMonthlyFilter } from './common.utils'

export const getTotalDeposit = async (dayOption, actionType, userId) => {
  let query
  if (dayOption === DATE_OPTION.DAY) {
    query = dateOptionsFilter({ transactionType: actionType, status: TRANSACTION_STATUS.SUCCESS }, dayOption)
  } else if (dayOption === DATE_OPTION.WEEK) {
    query = getWeeklyFilter({ transactionType: actionType, status: TRANSACTION_STATUS.SUCCESS })
  } else {
    query = getMonthlyFilter({ transactionType: actionType, status: TRANSACTION_STATUS.SUCCESS })
  }
  try {
    const totalDeposit = await db.PaymentTransaction.sum('amount', {
      where: { ...query, actioneeId: userId }
    })
    return totalDeposit
  } catch (error) {
    console.log(error)
  }
}

export const getTotalBetOrWin = async (dayOption, actionType, userId) => {
  let casinoQuery, customQuery, sportsBookQuery
  if (dayOption === DATE_OPTION.DAY) {
    casinoQuery = dateOptionsFilter({ actioneeId: userId, transactionType: (actionType === TRANSACTION_TYPES.BET) ? EAR_TRANSACTION_TYPE.DEBIT : EAR_TRANSACTION_TYPE.CREDIT, actionType: (actionType === TRANSACTION_TYPES.BET) ? EAR_ACTION_TYPE.BET : EAR_ACTION_TYPE.WIN }, dayOption)
    customQuery = dateOptionsFilter({ actioneeId: userId, transactionType: (actionType === TRANSACTION_TYPES.BET) ? TRANSACTION_TYPES.BET : TRANSACTION_TYPES.WIN, status: TRANSACTION_STATUS.SUCCESS }, dayOption)
    sportsBookQuery = dateOptionsFilter({ actioneeId: userId, actionType: (actionType === TRANSACTION_TYPES.BET) ? TRANSACTION_TYPES.BET : TRANSACTION_TYPES.WIN }, dayOption)
  } else if (dayOption === DATE_OPTION.WEEK) {
    casinoQuery = getWeeklyFilter({ actioneeId: userId, transactionType: (actionType === TRANSACTION_TYPES.BET) ? EAR_TRANSACTION_TYPE.DEBIT : EAR_TRANSACTION_TYPE.CREDIT, actionType: (actionType === TRANSACTION_TYPES.BET) ? EAR_ACTION_TYPE.BET : EAR_ACTION_TYPE.WIN })
    customQuery = getWeeklyFilter({ actioneeId: userId, transactionType: (actionType === TRANSACTION_TYPES.BET) ? TRANSACTION_TYPES.BET : TRANSACTION_TYPES.WIN, status: TRANSACTION_STATUS.SUCCESS })
    sportsBookQuery = getWeeklyFilter({ actioneeId: userId, actionType: (actionType === TRANSACTION_TYPES.BET) ? TRANSACTION_TYPES.BET : TRANSACTION_TYPES.WIN })
  } else {
    casinoQuery = getMonthlyFilter({ actioneeId: userId, transactionType: (actionType === TRANSACTION_TYPES.BET) ? EAR_TRANSACTION_TYPE.DEBIT : EAR_TRANSACTION_TYPE.CREDIT, actionType: (actionType === TRANSACTION_TYPES.BET) ? EAR_ACTION_TYPE.BET : EAR_ACTION_TYPE.WIN })
    customQuery = getMonthlyFilter({ actioneeId: userId, transactionType: (actionType === TRANSACTION_TYPES.BET) ? TRANSACTION_TYPES.BET : TRANSACTION_TYPES.WIN, status: TRANSACTION_STATUS.SUCCESS })
    sportsBookQuery = getMonthlyFilter({ actioneeId: userId, actionType: (actionType === TRANSACTION_TYPES.BET) ? TRANSACTION_TYPES.BET : TRANSACTION_TYPES.WIN })
  }

  try {
    const totalCasinoBet = await db.CasinoTransaction.sum('amount', {
      where: casinoQuery
    })

    const totalCustomBet = await db.Transaction.sum('amount', {
      where: customQuery
    })

    const totalSportBookBet = await db.SportBettingTransaction.sum('amount', {
      where: sportsBookQuery
    })

    return totalCasinoBet + totalCustomBet + totalSportBookBet
  } catch (error) {
    console.log(error)
  }
}

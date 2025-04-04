import { Op } from 'sequelize'
import { DATE_OPTION } from '../libs/constants'
export const dateOptionsFilter = (query, option) => {
  const endDate = Date.now()
  let startDate

  if (option === DATE_OPTION.DAY) {
    const newDate = new Date()

    startDate = newDate.toISOString().substring(0, 10)
  } else if (option === DATE_OPTION.WEEK) {
    const newDate = new Date()

    newDate.setDate(newDate.getDate() - 7)

    startDate = newDate.toISOString().substring(0, 10)
  } else if (option === DATE_OPTION.MONTH) {
    const newDate = new Date()

    newDate.setDate(newDate.getDate() - 30)

    startDate = newDate.toISOString().substring(0, 10)
  }

  query = {
    ...query,
    updatedAt: {
      [Op.and]: {
        [Op.gte]: `${(new Date(startDate)).toISOString().substring(0, 10)} 00:00:00.000+00`,
        [Op.lte]: `${(new Date(endDate)).toISOString().substring(0, 10)} 23:59:59.999+00`
      }
    }
  }

  return query
}

// This function will add date filter from previous Monday to next sunday.
export const getWeeklyFilter = (query) => {
  const today = new Date()
  const startDay = new Date(today)
  startDay.setDate(today.getDate() - today.getDay() + 1)
  const endDay = new Date(today)
  endDay.setDate(today.getDate() + (7 - today.getDay()))

  query.updatedAt = {
    [Op.and]: {
      [Op.gte]: startDay.toISOString().split('T')[0] + ' 00:00:00.000+00',
      [Op.lte]: endDay.toISOString().split('T')[0] + ' 23:59:59.999+00'
    }
  }

  return query
}

// This function will add date filter from 1st to last day of the current month.
export const getMonthlyFilter = (query) => {
  const today = new Date()
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  query.updatedAt = {
    [Op.and]: {
      [Op.gte]: startDay.toISOString().split('T')[0] + ' 00:00:00.000+00',
      [Op.lte]: lastDay.toISOString().split('T')[0] + ' 23:59:59.999+00'
    }
  }

  return query
}

import { Op } from 'sequelize'
export const isDateInFuture = (dateString) => {
  const inputDate = new Date(dateString)
  const currentDate = new Date()
  return inputDate > currentDate
}

// This function will add date filter from previous Monday to next sunday.
export const weekFilter = (query) => {
  const today = new Date()
  const startDay = new Date(today)
  startDay.setDate(today.getDate() - today.getDay() + 1)
  const endDay = new Date(today)
  endDay.setDate(today.getDate() + (7 - today.getDay()))

  query.readyToClaimAt = {
    [Op.and]: {
      [Op.gte]: startDay.toISOString().split('T')[0] + ' 00:00:00.000+00',
      [Op.lte]: endDay.toISOString().split('T')[0] + ' 23:59:59.999+00'
    }
  }
  return query
}

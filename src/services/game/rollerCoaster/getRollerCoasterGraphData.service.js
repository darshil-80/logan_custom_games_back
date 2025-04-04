import moment from 'moment'
import { Op } from 'sequelize'
import { sequelize } from '../../../db/models'
import APIError from '../../../errors/api.error'
import { getCachedData, setDataWithoutExpiry } from '../../../helpers/redis.helpers'
import { ROLLER_COASTER_GAME_STATE } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'

/**
 *
 *
 * @export
 * @class GetRollerCoasterGraphDataService
 * @extends {ServiceBase}
 */
export default class GetRollerCoasterGraphDataService extends ServiceBase {
  async run () {
    try {
      const {
        dbModels: {
          RollerCoasterGameTickPrice: RollerCoasterGameTickPriceModel,
          RollerCoasterGameRoundDetail: RollerCoasterGameRoundDetailModel
        }
      } = this.context

      const { interval, period, startdate: startDate, enddate: endDate } = this.args
      let graphData = []
      const lastTickPriceData = await getCachedData('lastTimeStampinDB')

      const rollerCoasterLastRoundDetail = await RollerCoasterGameRoundDetailModel.findOne({
        where: { roundState: ROLLER_COASTER_GAME_STATE.STARTED }
      })

      if (!lastTickPriceData) {
        const lastTickPriceDataInDB = await RollerCoasterGameTickPriceModel.findOne({
          order: [['created_at', 'ASC']]
        })

        await setDataWithoutExpiry('lastTimeStampinDB', lastTickPriceDataInDB?.createdAt)
      }

      if (interval && period && interval !== 'tick') {
        const cacheKey = `rollerCoaster-${period}-${interval}`
        const {
          cachedData,
          moreDataRequired,
          filteredCacheData,
          previousDataRequired,
          startDate: updatedStartDate,
          endDate: updatedEndDate
        } = await this.checkCachedData(cacheKey, startDate, endDate)

        if (!moreDataRequired) {
          return { graphData: filteredCacheData, rollerCoasterLastRoundDetail }
        }

        const newGraphData = await sequelize.query(`
          WITH interval AS (
            SELECT generate_series(
                CASE
                    WHEN :interval = '1 day' THEN date_trunc('day', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate))
                    WHEN :interval = '1 hour' THEN date_trunc('hour', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate))
                    WHEN :interval = '120 minute' THEN date_trunc('hour', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 120) * interval '1 minute'
                    WHEN :interval = '30 minute' THEN date_trunc('minute', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 30) * interval '1 minute'
                    WHEN :interval = '10 minute' THEN date_trunc('minute', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 10) * interval '1 minute'
                    WHEN :interval = '5 minute' THEN date_trunc('minute', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 5) * interval '1 minute'
                    WHEN :interval = '1 minute' THEN date_trunc('minute', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate))
                    WHEN :interval = '15 second' THEN date_trunc('second', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(SECOND FROM (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 15) * interval '1 second'
                    WHEN :interval = '5 second' THEN date_trunc('second', (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(SECOND FROM (SELECT MAX("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 5) * interval '1 second'
                END,
                CASE
                    WHEN :interval = '1 day' THEN date_trunc('day', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) + interval '1 day' - interval '1 second'
                    WHEN :interval = '1 hour' THEN date_trunc('hour', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate))
                    WHEN :interval = '120 minute' THEN date_trunc('hour', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 120) * interval '1 minute'
                    WHEN :interval = '30 minute' THEN date_trunc('minute', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 30) * interval '1 minute'
                    WHEN :interval = '10 minute' THEN date_trunc('minute', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 10) * interval '1 minute'
                    WHEN :interval = '5 minute' THEN date_trunc('minute', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(MINUTE FROM (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 5) * interval '1 minute'
                    WHEN :interval = '1 minute' THEN date_trunc('minute', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate))
                    WHEN :interval = '15 second' THEN date_trunc('second', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(SECOND FROM (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 15) * interval '1 second'
                    WHEN :interval = '5 second' THEN date_trunc('second', (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) - (CAST(EXTRACT(SECOND FROM (SELECT MIN("created_at") FROM roller_coaster_game_tick_price WHERE "created_at" >= :startDate AND "created_at" <= :endDate)) AS INTEGER) % 5) * interval '1 second'
                END,
                CASE
                    WHEN :interval = '1 day' THEN interval :temp
                    WHEN :interval = '1 hour' THEN interval :temp
                    WHEN :interval = '120 minute' THEN interval :temp
                    WHEN :interval = '30 minute' THEN interval :temp
                    WHEN :interval = '10 minute' THEN interval :temp
                    WHEN :interval = '5 minute' THEN interval :temp
                    WHEN :interval = '1 minute' THEN interval :temp
                    WHEN :interval = '15 second' THEN interval :temp
                    WHEN :interval = '5 second' THEN interval :temp
                END
            ) AS interval_start
          )
          SELECT
              interval_start AS start_timestamp,
              interval_start + interval :interval AS end_timestamp,
              (SELECT current_price FROM roller_coaster_game_tick_price WHERE "created_at" >= interval_start AND "created_at" < interval_start + interval :interval ORDER BY created_at ASC LIMIT 1) AS open,
              (SELECT MAX(current_price) FROM roller_coaster_game_tick_price WHERE "created_at" >= interval_start AND "created_at" < interval_start + interval :interval) AS high,
              (SELECT MIN(current_price) FROM roller_coaster_game_tick_price WHERE "created_at" >= interval_start AND "created_at" < interval_start + interval :interval) AS low,
              (SELECT current_price FROM roller_coaster_game_tick_price WHERE "created_at" >= interval_start AND "created_at" < interval_start + interval :interval ORDER BY created_at DESC LIMIT 1) AS close
          FROM
              interval
          GROUP BY
              interval_start
          ORDER BY
              interval_start DESC
          LIMIT 2000;
        `,
        {
          type: 'SELECT',
          raw: true,
          replacements: {
            temp: '- ' + period + ' ' + interval,
            interval: period + ' ' + interval,
            startDate: updatedStartDate,
            endDate: updatedEndDate
          }
        })

        if (!previousDataRequired) {
          graphData = newGraphData.concat(filteredCacheData)
          await this.updateRedisCache(cacheKey, cachedData, newGraphData, previousDataRequired)
        } else {
          graphData = filteredCacheData.concat(newGraphData)
          cachedData.length < 2000 || await this.updateRedisCache(cacheKey, cachedData, newGraphData, previousDataRequired)
        }
      } else {
        graphData = await RollerCoasterGameTickPriceModel.findAll({
          attributes: [
            ['current_price', 'open'],
            ['current_price', 'low'],
            ['current_price', 'high'],
            ['current_price', 'close'],
            ['created_at', 'start_timestamp']
          ],
          where: {
            createdAt: {
              [Op.gte]: new Date(startDate),
              [Op.lte]: new Date(endDate)
            }
          },
          limit: 2000,
          order: [['createdAt', 'desc']]
        })
      }

      const adjustedEndTime = await this.subtractInterval(endDate, period, interval)

      if (adjustedEndTime < new Date(lastTickPriceData)) {
        graphData = []
      }

      return { graphData, rollerCoasterLastRoundDetail }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }

  async checkCachedData (key, startDate, endDate) {
    // Check if there is any data available for the provided key
    const cachedData = JSON.parse(await getCachedData(key)) || []
    if (cachedData.length === 0) {
      return { startDate, endDate, filteredCacheData: [], cachedData: [], moreDataRequired: true, previousDataRequired: false }
    }

    const cacheEndTimestamp = cachedData[0].start_timestamp // End timestamp
    const cacheStartTimestamp = cachedData[cachedData.length - 1].start_timestamp // startTimestamp
    const startTimestamp = moment(startDate)
    const endTimestamp = moment(endDate)

    // Middle data
    if (startTimestamp.isAfter(cacheStartTimestamp) && endTimestamp.isBefore(cacheEndTimestamp) && startTimestamp.isBefore(cacheEndTimestamp) && endTimestamp.isAfter(cacheStartTimestamp)) {
      // Fetch middle data and provide in response don't update redis
      const filteredCacheData = await this.filterCacheData(startDate, endDate, cachedData)
      return { startDate, endDate, filteredCacheData, cachedData, moreDataRequired: false, previousDataRequired: false }
    } else if (startTimestamp.isAfter(cacheStartTimestamp) && endTimestamp.isAfter(cacheStartTimestamp) && startTimestamp.isBefore(cacheEndTimestamp) && endTimestamp.isAfter(cacheEndTimestamp)) {
      // Data present but new data require Fetch old data and append it with new data and update redis
      const filteredCacheData = await this.filterCacheData(startDate, endDate, cachedData)
      return { startDate: cacheEndTimestamp, endDate, filteredCacheData, cachedData, moreDataRequired: true, previousDataRequired: false }
    } else if (startTimestamp.isBefore(cacheStartTimestamp) && endTimestamp.isAfter(cacheStartTimestamp) && endTimestamp.isBefore(cacheEndTimestamp)) {
      // Data present but previous data required fetch new data and append with old data and check if redis update is required
      const filteredCacheData = await this.filterCacheData(startDate, endDate, cachedData)
      return { startDate, endDate: cacheStartTimestamp, filteredCacheData, cachedData, moreDataRequired: true, previousDataRequired: true }
    } else if (startTimestamp.isAfter(cacheEndTimestamp) && endTimestamp.isAfter(cacheEndTimestamp)) {
      // Data present, but stale, need new data required  Fetch stale data and append with new data and update redis
      return { startDate: cacheEndTimestamp, endDate, filteredCacheData: [], cachedData, moreDataRequired: true, previousDataRequired: false }
    } else if (startTimestamp.isBefore(cacheStartTimestamp) && endTimestamp.isBefore(cacheStartTimestamp)) {
      // Data present, but newer, need old data Fetch new data and append with old data and check if redis update is required
      return { startDate, endDate, filteredCacheData: [], cachedData, moreDataRequired: true, previousDataRequired: true }
    } else {
      return { startDate: cacheEndTimestamp, endDate, filteredCacheData: cachedData, cachedData, moreDataRequired: true, previousDataRequired: false }
    }
  }

  async updateRedisCache (key, cachedData, newData, previousDataRequired) {
    // Function will append data into redis cache and will only have 2000 data in array.
    let updatedCacheData = []
    updatedCacheData = previousDataRequired ? [...cachedData, ...newData] : [...newData, ...cachedData]
    updatedCacheData = updatedCacheData.slice(0, 2001)
    await setDataWithoutExpiry(key, JSON.stringify(updatedCacheData))
    return updatedCacheData
  }

  async filterCacheData (startDate, endDate, cachedData) {
    let startDateIndex = cachedData.length - 1
    let endDateIndex = 0

    const startDateTimestamp = new Date(startDate)
    const endDateTimestamp = new Date(endDate)

    for (let i = cachedData.length - 1; i >= 0; i--) {
      const itemDate = new Date(cachedData[i].date)
      if (itemDate >= startDateTimestamp) {
        startDateIndex = i
        return i
      }
    }

    for (let i = 0; i < cachedData.length; i++) {
      const itemDate = new Date(cachedData[i].date)
      if (itemDate <= endDateTimestamp) {
        endDateIndex = i
        return i
      }
    }

    return cachedData.slice(endDateIndex, startDateIndex + 1)
  }

  async subtractInterval (requestEndTime, period, interval) {
    const endDate = new Date(requestEndTime)
    const oneHourInMs = 60 * 60 * 1000

    switch (interval) {
      case 'minute':
        // Subtract period in minutes + 1 hour
        return new Date(endDate.getTime() - (period * 60 * 1000 + oneHourInMs))
      case 'second':
      case 'tick':
        // Subtract period in seconds
        return new Date(endDate.getTime() - (period * 1000))
      case 'day':
      case 'days':
        // Subtract period in days + 1 hour
        return new Date(endDate.getTime() - (period * 24 * 60 * 60 * 1000 + oneHourInMs))

      default:
        return ''
    }
  }
}

import moment from 'moment'
import { Op } from 'sequelize'
import { sequelize } from '../../../db/models'
import APIError from '../../../errors/api.error'
import { getCachedData, setDataWithoutExpiry } from '../../../helpers/redis.helpers'
import ajv from '../../../libs/ajv'
import { DEFAULT_GAME_ID } from '../../../libs/constants'
import ServiceBase from '../../../libs/serviceBase'
import GameSettingsService from '../common/gameSettings.service'

const schema = {
  type: 'object',
  properties: {
    interval: { type: 'string' },
    period: { type: 'string' },
    instrumentId: { type: 'string' },
    startdate: { type: 'string' },
    enddate: { type: 'string' }
  },
  required: ['instrumentId']
}

const constraints = ajv.compile(schema)
/**
 *
 *
 * @export
 * @class GetCryptoFuturesGraphService
 * @extends {ServiceBase}
 */
export default class GetCryptoFuturesGraphService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const {
        dbModels: {
          CryptoFuturesTickPrice: CryptoFuturesTickPriceModel
        }
      } = this.context

      const { interval, period, instrumentId, startdate: startDate, enddate: endDate } = this.args
      let graphData = []

      const gameSettings = await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.CRYPTO_FUTURES }, this.context)
      if (interval && period && interval !== 'tick') {
        const cacheKey = `crypto_futures-instrument-${instrumentId}-${period}-${interval}`

        const {
          cachedData,
          moreDataRequired,
          filteredCacheData,
          previousDataRequired,
          startDate: updatedStartDate,
          endDate: updatedEndDate
        } = await this.checkCachedData(cacheKey, startDate, endDate)

        if (!moreDataRequired) {
          return { graphData: filteredCacheData, instrumentSetting: gameSettings }
        }

        const newGraphData = await sequelize.query(`
        WITH time_intervals AS (
          SELECT generate_series(
              (SELECT MAX("created_at") FROM crypto_futures_tick_prices where "crypto_futures_instrument_id" = :instrumentId and created_at >= :startDate and created_at <= :endDate),
              (SELECT MIN("created_at") FROM crypto_futures_tick_prices where "crypto_futures_instrument_id" = :instrumentId and created_at >= :startDate and created_at <= :endDate),
              INTERVAL :negativeInterval
          ) AS interval_start
      )

      SELECT
          interval_start AS start_timestamp,
          (SELECT price FROM crypto_futures_tick_prices
              WHERE
              "crypto_futures_instrument_id" = :instrumentId and "created_at" >= interval_start ORDER BY created_at ASC LIMIT 1
          ) AS open,
          (SELECT MAX(price) FROM crypto_futures_tick_prices
              WHERE
              "crypto_futures_instrument_id" = :instrumentId AND "created_at" >= interval_start AND "created_at" <= interval_start + INTERVAL :interval
          ) AS high,
          (SELECT MIN(price) FROM crypto_futures_tick_prices
              WHERE
              "crypto_futures_instrument_id" = :instrumentId AND "created_at" >= interval_start AND "created_at" <= interval_start + INTERVAL :interval
          ) AS low,
          (SELECT price FROM crypto_futures_tick_prices
              WHERE
              "crypto_futures_instrument_id" = :instrumentId AND "created_at" <= interval_start + INTERVAL :interval ORDER BY created_at DESC LIMIT 1
          ) AS close
        FROM time_intervals
        GROUP BY interval_start
        ORDER BY interval_start DESC
        LIMIT 2000;
      `,
        {
          type: 'SELECT',
          raw: true,
          replacements: {
            interval: `${period} ${interval}`,
            negativeInterval: `- ${period} ${interval}`,
            instrumentId: +instrumentId,
            startDate: new Date(updatedStartDate),
            endDate: new Date(updatedEndDate)
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
        graphData = await CryptoFuturesTickPriceModel.findAll({
          attributes: [
            ['price', 'open'],
            ['price', 'low'],
            ['price', 'high'],
            ['price', 'close'],
            ['created_at', 'start_timestamp']],
          where: {
            createdAt: {
              [Op.gte]: new Date(startDate),
              [Op.lte]: new Date(endDate)
            },
            cryptoFuturesInstrumentId: instrumentId
          },
          limit: 2000,
          order: [['createdAt', 'desc']]
        })
      }
      return { graphData, instrumentSetting: gameSettings }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }

  async checkCachedData (key, startDate, endDate) {
    // Check if there is any data available for the provided key
    const cachedData = JSON.parse(await getCachedData(key))
    if (!cachedData) {
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

  // return new array of filtered cache
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
}

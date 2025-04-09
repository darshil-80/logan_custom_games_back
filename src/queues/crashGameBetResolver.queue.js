import Bull from 'bull'
import Redis from 'ioredis'
import queueWorkerRedisClient from '../libs/queueWorkerRedisClient'

// Shared options
const redisOptions = {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};


const opts = {
  createClient: function (type, opts) {
    switch (type) {
      case 'client':
        return queueWorkerRedisClient.client
      case 'subscriber':
        return queueWorkerRedisClient.publisherClient
      default:
        return new Redis(opts, redisOptions)
    }
  },
  redis: queueWorkerRedisClient.connection,
  defaultJobOptions: {
    attempts: 10,
    backoff: 60000,
    removeOnComplete: 10000
  }
}

export const crashGameBetResolverQueue = new Bull('CrashGameBetResolver-Queue', {
  ...opts
})

export const JOB_CRASH_GAME_AUTO_ESCAPE_BETS = 'CrashGameAutoEscapeBets'
export const JOB_CRASH_GAME_RESOLVE_ALL_BETS = 'CrashGameResolveAllBets'

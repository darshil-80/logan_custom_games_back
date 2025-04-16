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

export const crashGameQueue = new Bull('Demo-CrashGame-Queue', {
  ...opts
})

export const JOB_CRASH_GAME_START_ROUND = 'Demo-CrashGameStartRound'
export const JOB_CRASH_GAME_START_TIMER = 'Demo-CrashGameStartTimer'
export const JOB_CRASH_GAME_SET_BETTING_ON_HOLD = 'Demo-CrashGameSetBettingOnHold'
export const JOB_CRASH_GAME_START_GRAPH_TIMER = 'Demo-CrashGameStartGraphTimer'
export const JOB_CRASH_GAME_STOP_ROUND_GRAPH = 'Demo-CrashGameStopRoundGraph'
export const JOB_CRASH_GAME_STOP_ROUND = 'Demo-CrashGameStopRound'
export const JOB_RESTART_CRASH_GAME = 'Demo-RestartCrashGame'

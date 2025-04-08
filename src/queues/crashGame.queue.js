import Bull from 'bull'
import Redis from 'ioredis'
import queueWorkerRedisClient from '../libs/queueWorkerRedisClient'

const opts = {
  createClient: function (type, opts) {
    switch (type) {
      case 'client':
        return queueWorkerRedisClient.client
      case 'subscriber':
        return queueWorkerRedisClient.publisherClient
      default:
        return new Redis(opts)
    }
  },
  redis: queueWorkerRedisClient.connection,
  defaultJobOptions: {
    attempts: 10,
    backoff: 60000,
    removeOnComplete: 10000
  }
}

export const crashGameQueue = new Bull('CrashGame-Queue', {
  ...opts
})

export const JOB_CRASH_GAME_START_ROUND = 'CrashGameStartRound'
export const JOB_CRASH_GAME_START_TIMER = 'CrashGameStartTimer'
export const JOB_CRASH_GAME_SET_BETTING_ON_HOLD = 'CrashGameSetBettingOnHold'
export const JOB_CRASH_GAME_START_GRAPH_TIMER = 'CrashGameStartGraphTimer'
export const JOB_CRASH_GAME_STOP_ROUND_GRAPH = 'CrashGameStopRoundGraph'
export const JOB_CRASH_GAME_STOP_ROUND = 'CrashGameStopRound'
export const JOB_RESTART_CRASH_GAME = 'RestartCrashGame'

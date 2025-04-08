import { removeAllData } from '../../helpers/redis.helpers'
import { DEFAULT_GAME_ID } from '../../libs/constants'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import { crashGameQueue, JOB_CRASH_GAME_START_ROUND } from '../../queues/crashGame.queue'
import StopCrashGameRoundService from '../../services/game/game-engine-crash/stopCrashGameRound.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameStopRoundWorker extends WorkerBase {
  async run () {
    try {
      const jobData = this.args.job.data

      const result = await StopCrashGameRoundService.run({
        roundId: jobData.roundId
      }, {})

      CrashGameEmitter.emitCrashGameRoundStopped(result)

      const betCacheKey = `Bet-${DEFAULT_GAME_ID.CRASH}-*`
      await removeAllData(betCacheKey)

      await crashGameQueue.add(JOB_CRASH_GAME_START_ROUND, JOB_CRASH_GAME_START_ROUND, {
        priority: 1,
        delay: 2 * 1000,
        jobId: `${JOB_CRASH_GAME_START_ROUND}: RoundId-${+jobData.id + 1}`
      })
    } catch (err) {
      console.log(err)
      throw err
    }

    return true
  }
}

export default async (job) => {
  const result = await CrashGameStopRoundWorker.run({ job })
  return result
}

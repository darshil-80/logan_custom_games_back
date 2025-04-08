import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import { crashGameQueue, JOB_CRASH_GAME_STOP_ROUND } from '../../queues/crashGame.queue'
import { crashGameBetResolverQueue, JOB_CRASH_GAME_RESOLVE_ALL_BETS } from '../../queues/crashGameBetResolver.queue'
import StopCrashGameRoundGraphService from '../../services/game/game-engine-crash/stopCrashGameRoundGraph.service'

class CrashGameStopRoundGraphWorker extends WorkerBase {
  async run () {
    try {
      const jobData = this.args.job.data
      await StopCrashGameRoundGraphService.run({
        roundId: jobData.roundId
      }, {})

      crashGameBetResolverQueue.add(JOB_CRASH_GAME_RESOLVE_ALL_BETS, {
        roundId: jobData.roundId
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_RESOLVE_ALL_BETS}: RoundId-${jobData.id}`
      })

      await crashGameQueue.add(JOB_CRASH_GAME_STOP_ROUND, {
        roundId: jobData.roundId,
        id: jobData.id
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_STOP_ROUND}: RoundId-${jobData.id}`
      })
    } catch (err) {
      console.log(err)
      throw err
    }

    return true
  }
}

export default async (job) => {
  const result = await CrashGameStopRoundGraphWorker.run({ job })
  return result
}

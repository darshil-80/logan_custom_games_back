import inMemoryDB from '../../libs/inMemoryDb'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import { crashGameQueue, JOB_CRASH_GAME_START_GRAPH_TIMER } from '../../queues/crashGame.queue'
import GetAllCrashGamePlacedBetsService from '../../services/game/game-engine-crash/getAllCrashGamePlacedBets.service'
import SetCrashGameRoundBettingOnHoldService from '../../services/game/game-engine-crash/setCrashGameRoundBettingOnHold.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameSetBettingOnHoldWorker extends WorkerBase {
  async run () {
    try {
      const jobData = this.args.job.data
      const result = await SetCrashGameRoundBettingOnHoldService.run({
        roundId: jobData.roundId
      }, {})

      const bets = await GetAllCrashGamePlacedBetsService.run({ roundId: jobData.roundId }, {})

      CrashGameEmitter.emitCrashGameRoundBettingOnHold(result)
      CrashGameEmitter.emitCrashGamePlacedBets(bets)

      await crashGameQueue.add(JOB_CRASH_GAME_START_GRAPH_TIMER, {
        roundId: result.roundId,
        id: result.id
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_START_GRAPH_TIMER}: RoundId-${jobData.id}`
      })
    } catch (err) {
      console.log(err)
      throw err
    }

    return true
  }
}

export default async (job) => {
  const result = await CrashGameSetBettingOnHoldWorker.run({ job })
  return result
}

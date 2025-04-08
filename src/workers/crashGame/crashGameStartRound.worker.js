import inMemoryDB from '../../libs/inMemoryDb'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import { crashGameQueue, JOB_CRASH_GAME_START_TIMER } from '../../queues/crashGame.queue'
import GetAllCrashGamePlacedBetsService from '../../services/game/game-engine-crash/getAllCrashGamePlacedBets.service'
import StartCrashGameRoundService from '../../services/game/game-engine-crash/startCrashGameRound.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameStartRoundWorker extends WorkerBase {
  async run () {
    try {

      const result = await StartCrashGameRoundService.run(
        {},
        {})
      const bets = await GetAllCrashGamePlacedBetsService.run(result, {})

      CrashGameEmitter.emitCrashGameRoundStarted(result)
      CrashGameEmitter.emitCrashGamePlacedBets(bets)

      await crashGameQueue.add(JOB_CRASH_GAME_START_TIMER, {
        roundId: result.roundId || 1,
        id: result.id || 1
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_START_TIMER}: RoundId-${result.id}`
      })
    } catch (err) {
      console.log(err)
      throw err
    }
    return true
  }
}

export default async (job) => {
  const result = await CrashGameStartRoundWorker.run({ job })
  return result
}

import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import GetAllCrashGamePlacedBetsService from '../../services/game/game-engine-crash/getAllCrashGamePlacedBets.service'
import ResolveAllCrashBetsService from '../../services/game/game-engine-crash/resolveAllCrashBets.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameResolveAllBetsWorker extends WorkerBase {
  async run () {
    try {
      const result = await ResolveAllCrashBetsService.run(this.args.job.data, {})

      const bets = await GetAllCrashGamePlacedBetsService.run(this.args.job.data, {})
      CrashGameEmitter.emitCrashGamePlacedBets(bets)

      return result
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

export default async (job) => {
  const result = await CrashGameResolveAllBetsWorker.run({ job })
  return result
}

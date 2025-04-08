import models, { sequelize } from '../../db/models'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import AutoPlayerEscapeCrashGameService from '../../services/game/game-engine-crash/autoPlayerEscapeCrashGame.service'
import GetAllCrashGamePlacedBetsService from '../../services/game/game-engine-crash/getAllCrashGamePlacedBets.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameAutoEscapeBetsWorker extends WorkerBase {
  async run () {
    try {
      const result = await AutoPlayerEscapeCrashGameService.run(this.args.job.data, {})

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
  const result = await CrashGameAutoEscapeBetsWorker.run({ job })
  return result
}

import Timer from 'easytimer.js'
import models, { sequelize } from '../../db/models'
import '../../json-schemas'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import { crashGameQueue, JOB_CRASH_GAME_STOP_ROUND_GRAPH } from '../../queues/crashGame.queue'
import { crashGameBetResolverQueue, JOB_CRASH_GAME_AUTO_ESCAPE_BETS } from '../../queues/crashGameBetResolver.queue'
import GetCrashGameRoundDetailByIdService from '../../services/game/game-engine-crash/getCrashGameRoundDetailById.service'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameStartGraphTimerWorker extends WorkerBase {
  getTimeByCrashRate (crashRate) {
    return +(Math.log2(crashRate) / 0.09).toFixed(1)
  }

  async run () {
    const jobData = this.args.job.data
    const timerInstance = new Timer()

    const roundInfo = await GetCrashGameRoundDetailByIdService.run(jobData, { dbModels: models, sequelize })
    if (!roundInfo) {
      throw new Error('No round found')
    }

    const time = this.getTimeByCrashRate(roundInfo.crashRate)

    const onHoldAt = roundInfo.onHoldAt

    timerInstance.addEventListener('stopped', async () => {
      // AutoPlayerEscapeCrashGameService.execute({ secondTenths: time * 10, roundId: jobData.roundId })

      crashGameBetResolverQueue.add(JOB_CRASH_GAME_AUTO_ESCAPE_BETS, {
        secondTenths: time * 10,
        roundId: jobData.roundId
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_AUTO_ESCAPE_BETS}: RoundId-${jobData.id} SecondTenths-${time * 10}`
      })

      CrashGameEmitter.emitCrashGameGraphTimer({ runningStatus: false, secondTenths: time * 10, onHoldAt, seconds: 0, roundId: jobData.roundId })
      await crashGameQueue.add(JOB_CRASH_GAME_STOP_ROUND_GRAPH, {
        roundId: jobData.roundId,
        id: jobData.id
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_STOP_ROUND_GRAPH}: RoundId-${jobData.id}`
      })
    })

    if (time <= 0) {
      CrashGameEmitter.emitCrashGameGraphTimer({ runningStatus: true, secondTenths: 0, seconds: 0, onHoldAt, roundId: jobData.roundId })
      timerInstance.stop()
      return
    }

    timerInstance.addEventListener('started', () => {
      CrashGameEmitter.emitCrashGameGraphTimer({ runningStatus: true, ...timerInstance.getTotalTimeValues(), onHoldAt, roundId: jobData.roundId })
    })

    timerInstance.start({
      target: [time * 10, 0, 0, 0, 0],
      precision: 'seconds',
      callback: () => {
        // AutoPlayerEscapeCrashGameService.execute({ secondTenths: timerInstance.getTotalTimeValues().secondTenths, roundId: jobData.roundId })
        const secondTenths = timerInstance.getTotalTimeValues().secondTenths

        if (+secondTenths % 5 === 0) {
          crashGameBetResolverQueue.add(JOB_CRASH_GAME_AUTO_ESCAPE_BETS, {
            secondTenths: secondTenths,
            roundId: jobData.roundId
          }, {
            priority: 1,
            jobId: `${JOB_CRASH_GAME_AUTO_ESCAPE_BETS}: RoundId-${jobData.id} SecondTenths-${secondTenths}`
          })

          CrashGameEmitter.emitCrashGameGraphTimer({ runningStatus: true, ...timerInstance.getTotalTimeValues(), onHoldAt, roundId: jobData.roundId })
        }
      }
    })
  }
}

export default async (job) => {
  const result = await CrashGameStartGraphTimerWorker.run({ job })
  return result
}

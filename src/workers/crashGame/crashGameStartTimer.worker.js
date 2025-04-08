import Timer from 'easytimer.js'
import '../../json-schemas'
import { crashGameQueue, JOB_CRASH_GAME_SET_BETTING_ON_HOLD } from '../../queues/crashGame.queue'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import CrashGameEmitter from '../../socket-resources/emitters/crashGame.emitter'

class CrashGameStartTimerWorker extends WorkerBase {
  async run () {
    const jobData = this.args.job.data
    console.log("jobDatajobData", jobData)
    const timerInstance = new Timer()
    timerInstance.addEventListener('stopped', async () => {
      CrashGameEmitter.emitCrashGameWaitingTimer({ runningStatus: false, seconds: 0, roundId: jobData.roundId })

      await crashGameQueue.add(JOB_CRASH_GAME_SET_BETTING_ON_HOLD, {
        roundId: jobData.roundId,
        id: jobData.id
      }, {
        priority: 1,
        jobId: `${JOB_CRASH_GAME_SET_BETTING_ON_HOLD}: RoundId-${jobData.id}`
      })
    })

    timerInstance.addEventListener('started', () => {
      CrashGameEmitter.emitCrashGameWaitingTimer({ runningStatus: true, ...timerInstance.getTotalTimeValues(), roundId: jobData.roundId })
    })

    timerInstance.start({
      startValues: [0, 8, 0, 0, 0],
      precision: 'seconds',
      countdown: true,
      callback: () => {
        CrashGameEmitter.emitCrashGameWaitingTimer({ runningStatus: true, ...timerInstance.getTotalTimeValues(), roundId: jobData.roundId })
      }
    })
  }
}

export default async (job) => {
  const result = await CrashGameStartTimerWorker.run({ job })
  return result
}

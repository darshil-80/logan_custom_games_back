import { CRASH_GAME_STATE } from '../../libs/constants'
import '../../libs/setUpGraceFullShutDown'
import WorkerBase from '../../libs/workerBase'
import { crashGameQueue, JOB_CRASH_GAME_SET_BETTING_ON_HOLD, JOB_CRASH_GAME_START_ROUND, JOB_CRASH_GAME_STOP_ROUND, JOB_CRASH_GAME_STOP_ROUND_GRAPH } from '../../queues/crashGame.queue'
import GetCurrentCrashGameStateService from '../../services/game/game-engine-crash/getCurrentCrashGameState.service'
import GetHouseEdgeAndMinMaxOddsService from '../../services/game/game-engine-crash/getHouseEdgeAndMinMaxOdds.service'

class RestartCrashGameWorker extends WorkerBase {
  getTimeByCrashRate (crashRate) {
    return +(Math.log2(crashRate) / 0.09).toFixed(1)
  }
  
  async run () {
    const gameSetting = await GetHouseEdgeAndMinMaxOddsService.run({ gameId: 3 }, {})
    const result = await GetCurrentCrashGameStateService.run({}, {})
    if (!result) {
      crashGameQueue.add(JOB_CRASH_GAME_START_ROUND, JOB_CRASH_GAME_START_ROUND, {
        priority: 1,
        delay: 2 * 1000,
        jobId: `${JOB_CRASH_GAME_START_ROUND}: RoundId-1`
      })
      return
    }

    const { roundId, id, roundState } = result
    let job
    switch (roundState) {
      case CRASH_GAME_STATE.STOPPED:
        console.log('start new round', +id + 1)

        job = await crashGameQueue.getJob(`${JOB_CRASH_GAME_START_ROUND}: RoundId-${+id + 1}`)
        if (job && job.returnvalue === null) {
          await job.moveToFailed('Forced', true)
          await job.remove()
        }
        crashGameQueue.add(JOB_CRASH_GAME_START_ROUND, JOB_CRASH_GAME_START_ROUND, {
          priority: 1,
          delay: 2 * 1000,
          jobId: `${JOB_CRASH_GAME_START_ROUND}: RoundId-${+id + 1}`
        })
        break
      case CRASH_GAME_STATE.STARTED:
        console.log('betting on hold start graph timer')
        job = await crashGameQueue.getJob(`${JOB_CRASH_GAME_SET_BETTING_ON_HOLD}: RoundId-${id}`)

        if (job && job.returnvalue === null) {
          await job.moveToFailed('Forced', true)
          await job.remove()
        }
        crashGameQueue.add(JOB_CRASH_GAME_SET_BETTING_ON_HOLD, { roundId, id }, {
          priority: 1,
          delay: 10 * 1000,
          jobId: `${JOB_CRASH_GAME_SET_BETTING_ON_HOLD}: RoundId-${id}`
        })
        break
      case CRASH_GAME_STATE.ON_HOLD:
        console.log('graph timer was running, stop graph timer')
        job = await crashGameQueue.getJob(`${JOB_CRASH_GAME_STOP_ROUND_GRAPH}: RoundId-${id}`)

        if (job && job.returnvalue === null) {
          await job.moveToFailed('Forced', true)
          await job.remove()
        }
        crashGameQueue.add(JOB_CRASH_GAME_STOP_ROUND_GRAPH, { roundId, id }, {
          priority: 1,
          delay: this.getTimeByCrashRate(gameSetting.maxOdd) * 1000,
          jobId: `${JOB_CRASH_GAME_STOP_ROUND_GRAPH}: RoundId-${id}`
        })
        break
      case CRASH_GAME_STATE.GRAPH_FINISHED:
        console.log('graph timer stopped, finish round')
        job = await crashGameQueue.getJob(`${JOB_CRASH_GAME_STOP_ROUND}: RoundId-${id}`)

        console.log(job)

        if (job && job.returnvalue === null) {
          await job.moveToFailed('Forced', true)
          await job.remove()
        }
        crashGameQueue.add(JOB_CRASH_GAME_STOP_ROUND, { roundId, id }, {
          priority: 1,
          jobId: `${JOB_CRASH_GAME_STOP_ROUND}: RoundId-${id}`
        })
        break
    }
    return true
  }
}

export default async (job) => {
  const result = await RestartCrashGameWorker.run({ job })
  return result
}

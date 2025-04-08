import path from 'path'
import { crashGameQueue, JOB_CRASH_GAME_SET_BETTING_ON_HOLD, JOB_CRASH_GAME_START_GRAPH_TIMER, JOB_CRASH_GAME_START_ROUND, JOB_CRASH_GAME_START_TIMER, JOB_CRASH_GAME_STOP_ROUND, JOB_CRASH_GAME_STOP_ROUND_GRAPH, JOB_RESTART_CRASH_GAME } from '../../queues/crashGame.queue'

crashGameQueue.process(JOB_CRASH_GAME_START_ROUND, 1, path.join(__dirname, './crashGameStartRound.worker'))

crashGameQueue.process(JOB_CRASH_GAME_START_TIMER, 1, path.join(__dirname, './crashGameStartTimer.worker'))

crashGameQueue.process(JOB_CRASH_GAME_SET_BETTING_ON_HOLD, 1, path.join(__dirname, './crashGameSetBettingOnHold.worker'))

crashGameQueue.process(JOB_CRASH_GAME_START_GRAPH_TIMER, 1, path.join(__dirname, './crashGameStartGraphTimer.worker'))

crashGameQueue.process(JOB_CRASH_GAME_STOP_ROUND_GRAPH, 1, path.join(__dirname, './crashGameStopRoundGraph.worker'))

crashGameQueue.process(JOB_CRASH_GAME_STOP_ROUND, 1, path.join(__dirname, './crashGameStopRound.worker'))

crashGameQueue.process(JOB_RESTART_CRASH_GAME, 1, path.join(__dirname, './restartCrashGame.worker'))

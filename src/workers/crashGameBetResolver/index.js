import path from 'path'
import { crashGameBetResolverQueue, JOB_CRASH_GAME_AUTO_ESCAPE_BETS, JOB_CRASH_GAME_RESOLVE_ALL_BETS } from '../../queues/crashGameBetResolver.queue'

crashGameBetResolverQueue.process(JOB_CRASH_GAME_AUTO_ESCAPE_BETS, 1, path.join(__dirname, './crashGameAutoEscapeBets.worker'))

crashGameBetResolverQueue.process(JOB_CRASH_GAME_RESOLVE_ALL_BETS, 1, path.join(__dirname, './crashGameResolveAllBets.worker'))

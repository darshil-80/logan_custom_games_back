import crypto from 'crypto'
import ServiceBase from '../../../libs/serviceBase'
import { CRASH_GAME_STATE, DEFAULT_GAME_ID } from '../../../libs/constants'
import GetHouseEdgeAndMinMaxOddsService from './getHouseEdgeAndMinMaxOdds.service'
import inMemoryDB from '../../../libs/inMemoryDb'
import { v4 as uuidv4 } from 'uuid'

/**
 *
 *
 * @export
 * @class StartCrashGameRoundService
 * @extends {ServiceBase}
 */
export default class StartCrashGameRoundService extends ServiceBase {
  gameResult (seed, salt, settings) {
    const nBits = 52 // number of most significant bits to use

    // 1. HMAC_SHA256(key=salt, message=seed)
    const hmac = crypto.createHmac('sha256', salt)
    hmac.update(seed)
    seed = hmac.digest('hex')

    // 2. r = 52 most significant bits
    seed = seed.slice(0, nBits / 4)
    const r = parseInt(seed, 16)

    // 3. X = r / 2^52
    let X = r / Math.pow(2, nBits) // uniformly distributed in [0; 1)

    // 4. X = 99 / (1-X)
    X = (100 - settings.houseEdge) / (X)

    // 5. return max(trunc(X), 100)
    const result = Math.floor(X)
    return Math.max(settings.minOdd, Math.min(settings.maxOdd, result / 100))
  }

  async run () {
    const roundDetails = await inMemoryDB.getAll('crashGameRounddetails')
    const roundRunning = await roundDetails.find(round => round.roundState !== CRASH_GAME_STATE.STOPPED)
    
    if (roundRunning) {
      return
    }

    const getHouseEdgeAndMinMaxOddsResult = await GetHouseEdgeAndMinMaxOddsService.execute({ gameId: DEFAULT_GAME_ID.CRASH }, this.context)

    const hash = crypto.randomBytes(32).toString('hex')
    const crashRate = this.gameResult(hash, '0000000000000000004d6ec16dafe9d8370958664c1dc422f452892264c59526', getHouseEdgeAndMinMaxOddsResult.result)

    let uniqId = 1;
    if(roundDetails?.length) {
      const roundIds = roundDetails.map(r => r.id);
      uniqId = Math.max(...roundIds);
      if(roundIds.includes(uniqId)) uniqId = uniqId + 1
    }
    await inMemoryDB.set('crashGameRounddetails', uniqId, {
      roundId: uuidv4(),
      id: uniqId,
      crashRate,
      roundHash: hash,
      roundState: CRASH_GAME_STATE.STARTED,
      currentGameSettings: JSON.stringify(getHouseEdgeAndMinMaxOddsResult.result),
      onHoldAt: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      roundSignature: crypto.createHash('md5').update(`${Number(crashRate).toFixed(2)}-${hash}`).digest('hex')
    })

    const crashGameRound = await inMemoryDB.get('crashGameRounddetails', uniqId)
    return crashGameRound || {}
  }
}

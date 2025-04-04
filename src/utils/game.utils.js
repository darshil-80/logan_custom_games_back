import { calculateOdds } from './math.utils'
import { BLACK_JACK_DOUBLE_POINTS, TOTAL_CARDS } from '../libs/constants'
import crypto from 'crypto'

// Mine Game
export const calculateMineGameOdd = ({ mineGameBet, openedTileCount, gameSettings, MAX_TILE_COUNT }) => {
  let combinedOdds = 1
  console.log("openedTileCount", openedTileCount)
  for (let index = 0; index < openedTileCount; index++) {
    combinedOdds *= 1 / ((MAX_TILE_COUNT - mineGameBet.mineCount - index) / (MAX_TILE_COUNT - index))
  }
  console.log(calculateOdds(gameSettings, combinedOdds));
  return calculateOdds(gameSettings, combinedOdds)
}

// BlackJack Game
export const getCardPoints = (cardList) => {
  let cardPoints = 0
  let acePoints = 0

  cardList.forEach(card => {
    if (card[0] === 1) {
      acePoints += 11
    } else {
      acePoints += card[0]
    }
    cardPoints += card[0]
  })

  if (acePoints > 21) {
    acePoints = cardPoints
  }

  return { acePoints, cardPoints }
}

export const canDoubleBet = (playerHand) => {
  if (playerHand.length !== 2) return false
  const { acePoints, cardPoints } = getCardPoints(playerHand)
  return BLACK_JACK_DOUBLE_POINTS.includes(Math.max(acePoints, cardPoints))
}

export const canSplitBet = (playerHand) => {
  if (playerHand.length !== 2) return false
  return playerHand[0][0] === playerHand[1][0]
}

export const getTotalCards = (allBets) => {
  let drawnCards = 0

  allBets.forEach(bet => {
    if (bet.parentBetId === null) {
      drawnCards += bet.dealerHand.length
    }
    drawnCards += bet.playerHand.length
  })

  return TOTAL_CARDS - drawnCards
}

export const crashGameResult = (seed, salt, settings) => {
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

/* ==========================================================================
  PLINKO GAME UTILS
========================================================================== */
/**
 *
 * @param {array} betMultiplierPosition Position of the bet multiplier
 * @param {string} ballTrajectory Trajectory of the ball
 * @returns {boolean} If ball hits the bet multiplier
 */
export const isBallHittingBetMultiplier = (betMultiplierPosition, ballTrajectory) => {
  const [x, y] = betMultiplierPosition
  const resultingY = ballTrajectory.slice(0, 0 + (x - 1)).split('').reduce((acc, cv) => acc + (+cv), 2)
  return resultingY === y
}

/**
 *
 * @param {array} betMultipliers Array of bet multiplier objects
 * @param {string} ballTrajectory Trajectory of the ball
 * @returns {number} Total multiplier at the end
 */
export const getResultingBetMultiplierByBallTrajectory = (betMultipliers, ballTrajectory) => {
  let resultingMultiplier = 1
  betMultipliers.forEach(betMultiplier => {
    if (isBallHittingBetMultiplier(betMultiplier.position, ballTrajectory)) {
      const multiplier = +betMultiplier.multiplier?.split('x')[0]
      resultingMultiplier *= multiplier
    }
  })

  return resultingMultiplier
}

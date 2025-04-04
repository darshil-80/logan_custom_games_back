/**
 *
 * @param {Number} n
 * @returns {Number} factorial of n
 */
export const factorial = n => {
  let fact = 1
  for (let i = 2; i <= n; i++) {
    fact *= i
  }
  return fact
}

/**
 *
 * @param {Number} n
 * @param {Number} r
 * @returns {Number} combination of n over r
 */
export const combination = (n, r) => {
  if (r > n) {
    return 0
  }
  return factorial(n) / (factorial(r) * factorial(n - r))
}

/**
 *
 * @param {Number} numberOfCoins
 * @param {Number} minimumChosenOutcome
 * @returns {Number} probability of minimum X number of favorable outcomes
 */
export const getCoinOutcomeProbability = (numberOfCoins, minimumChosenOutcome) => {
  const n = numberOfCoins - minimumChosenOutcome
  let sum = 0
  for (let i = 0; i <= n; i++) {
    sum += combination(numberOfCoins, i)
  }
  return sum / 2 ** numberOfCoins
}

/**
 *
 * @param {string} s
 * @returns {Number} count of one
 */
export const countOnes = (s) => {
  let count = 0
  for (const i of s) {
    if (i === '1') {
      count++
    }
  }
  return count
}

/**
 *
 * @param {Object} gameSettings
 * @param {Number} probability
 * @returns {Number} Calculated Odds
 */
export const calculateOdds = (gameSettings, odds) => {
  return Math.floor(Math.max(1, Math.min(gameSettings.maxOdds, odds * (1 - gameSettings.houseEdge / 100))) * 100) / 100
}

/**
 *
 *
 * @param {Number} number
 * @param {Number} decimal
 * @return {Number}
 * roundOf the number as per the decimal passed
 */
export const roundOf = (number, decimal) => {
  return parseInt(number * 10 ** decimal) / 10 ** decimal
}

/**
 *
 * @param {number} value
 * @param {number} precision
 * @returns {number} Returns precision value for specified decimal places
 */
export const getPrecision = (value, precision = 2) => {
  const precisionDivide = 10 ** precision
  const result = parseInt(value * precisionDivide) / precisionDivide
  return result
}

import crypto from 'crypto'
import { getServerSeedCacheKey, getUserTokenCacheKey } from '../utils/user.utils'
import { getTTL, setData } from './redis.helpers'

export const createHMACSignature = (data, secretKey) => {
  const message = JSON.stringify(data)

  const computedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('hex')
  return computedSignature
}

export const verifyHMACSignature = (data, signature, secretKey) => {
  const message = JSON.stringify(data)

  const computedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('hex')
  return signature === computedSignature
}

/**
 *
 *
 * @param {string} data
 * @return {string}
 */
export const createSHA256Hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 *
 * @param {string} userId
 * @param {string} userCode
 * @returns {string} This method generates and returns hash of server
 */
export const generateServerSeedHash = async (userId) => {
  // Generate a random seed
  const serverSeed = crypto.randomBytes(16).toString('hex')

  // Equate the expiry time for seed to user auth token
  const expiryTime = Math.floor(Math.random() * (86400 - 3600 + 1)) + 3600;

  // Set in redis
  await setData(getServerSeedCacheKey(userId), serverSeed, expiryTime)

  // Return the hashed seed
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex')

  return { serverSeedHash }
}

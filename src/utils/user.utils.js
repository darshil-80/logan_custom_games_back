export const getUserTokenCacheKey = (userId) => {
  return `UserToken-${userId}`
}

export const getServerSeedCacheKey = (userId) => {
  return `ServerSeed-${userId}`
}

export const getProviderUserTokenCacheKey = (userId) => {
  return `ProviderUserToken-${userId}`
}

export const getLightningBoardCacheKey = () => {
  return 'LightningBoardDetails'
}

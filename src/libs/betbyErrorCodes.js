export const BETBY_ERROR_CODES = {
  // Generic Error
  UNKNOWN_ERROR: 400,
  USER_NOT_FOUND: 404,
  INTERNAL_ERROR: 400,
  INSUFFICIENT_FUND: 2001,
  WALLET_NOT_FOUND: 2002,
  BAD_REQUEST: 2004,
  TRANSACTION_NOT_FOUND: 2003
}

export const BETBY_ERROR_MSG = {
  PLAYER_NOT_FOUND: 'player not found',
  INSUFFICIENT_FUND: 'Not enough money',
  BAD_REQUEST: 'Bad Request',
  INVALID_CURRENCY: 'Invalid currency',
  WALLET_NOT_FOUND: 'Wallet not found',
  TRANSACTION_NOT_FOUND: 'Transaction Not Found',
  INTERNAL_ERROR: 'Internal error'
}

export const BETBY_UNKNOWN_ERROR_RESPONSE = {
  status: false,
  errors: {
    code: BETBY_ERROR_CODES.UNKNOWN_ERROR,
    error: 'something went wrong'
  }
}

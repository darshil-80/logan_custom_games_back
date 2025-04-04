export const EAR_ERROR_CODES = {
  // Generic Error
  UNKNOWN_ERROR: 400,
  USER_NOT_FOUND: 404,
  INTERNAL_ERROR: 500
}

export const EAR_ERROR_MSG = {
  UNKNOWN_ERROR: 'something went wrong'
}

export const EAR_UNKNOWN_ERROR_RESPONSE = {
  status: false,
  errors: {
    code: EAR_ERROR_CODES.UNKNOWN_ERROR,
    error: 'something went wrong'
  }
}

import _ from 'lodash'
import { BETBY_ERROR_CODES, BETBY_UNKNOWN_ERROR_RESPONSE } from '../libs/betbyErrorCodes'

export const sendBetbyCallbackResponse = ({ req, res, next }, { successful, result }) => {
  if (successful && !_.isEmpty(result)) {
    res.payload = result
    const statusCode = result.statusCode || 200

    // If status code is 2002 or 2004, handle it as a special "error but successful" response
    if (statusCode === 2002 || statusCode === 2004 || statusCode === 2001) {
      return res.status(400).json({
        code: statusCode, // Send statusCode as part of the response
        message: result.message || 'Custom error occurred' // Use result.message or default message
      })
    }

    // For status code 200, return the result as it is
    if (statusCode === 200) {
      return res.status(200).json(result)
    }

    // For other non-200 status codes, send a response with the given status code
    delete res.payload.statusCode  // Clean up response payload
    res.status(statusCode).json({ ...res.payload })
  } else {
    // In case of failure, return the unknown error response
    res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
  }
}

export const divideByHundred = (data) => {
  return data / 100
}

export const multipleByHundred = (data) => {
  return data * 100
}

import _ from 'lodash'
import { EAR_ERROR_CODES, EAR_UNKNOWN_ERROR_RESPONSE } from '../libs/earErrorCodes'

export const sendEarCallbackResponse = ({ req, res, next }, { successful, result }) => {
  if (successful && !_.isEmpty(result)) {
    res.payload = result
    const statusCode = result.statusCode || 200
    delete res.payload.statusCode
    res.status(statusCode).json({ ...res.payload })
  } else {
    res.status(EAR_ERROR_CODES.UNKNOWN_ERROR).json(EAR_UNKNOWN_ERROR_RESPONSE)
  }
}

import GetUserInfoCallbackService from '../../services/earCasinoCallback/getUserInfoCallback.service'
import TransactionCallbackService from '../../services/earCasinoCallback/transactionCallback.service'
import GameLaunchService from '../../services/earCasinoCallback/gameLaunch'
import DemoGameLaunchService from '../../services/earCasinoCallback/gameLaunchDemo'
import { EAR_ERROR_CODES, EAR_UNKNOWN_ERROR_RESPONSE } from '../../libs/earErrorCodes'
import { sendEarCallbackResponse } from '../../helpers/earCasinoCallback.helper'
import { sendResponse } from '../../helpers/response.helpers'

export default class EarCasinoController {
  static async gameLaunchDemo (req, res, next) {
    try {
      const { result, successful, errors } = await DemoGameLaunchService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async gameLaunch (req, res, next) {
    try {
      const { result, successful, errors } = await GameLaunchService.execute(req.body, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getUserInfo (req, res, next) {
    try {
      const { result, successful } = await GetUserInfoCallbackService.execute(req.body, req.context)
      sendEarCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(EAR_ERROR_CODES.UNKNOWN_ERROR).json(EAR_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async transaction (req, res, next) {
    try {
      const { result, successful } = await TransactionCallbackService.execute(req.body, req.context)
      sendEarCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(EAR_ERROR_CODES.UNKNOWN_ERROR).json(EAR_UNKNOWN_ERROR_RESPONSE)
    }
  }
}

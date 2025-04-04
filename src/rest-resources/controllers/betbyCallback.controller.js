import { sendBetbyCallbackResponse } from '../../helpers/betbyCallback.helpers'
import { BETBY_ERROR_CODES, BETBY_UNKNOWN_ERROR_RESPONSE } from '../../libs/betbyErrorCodes'
import CommitCallbackService from '../../services/betbyCallback/betCommit.service'
import BetDiscardService from '../../services/betbyCallback/betDiscard.service'
import BetLostService from '../../services/betbyCallback/betLost.service'
import BetMakeCallbackService from '../../services/betbyCallback/betMake.service'
import BetRefundService from '../../services/betbyCallback/betRefund.service'
import BetRollbackService from '../../services/betbyCallback/betRollback.service'
import BetSettlementService from '../../services/betbyCallback/betSettlement.service'
import BetWinService from '../../services/betbyCallback/betWin.service'
import CreateUserTokenService from '../../services/betbyCallback/createUserToken'
import PingCallbackService from '../../services/betbyCallback/ping.service'

/**
 * Betby Callback Controller for Casino
 *
 * @export
 * @class BetbyController
 */
export default class BetbyCallbackController {
  static async pingCallback (req, res, next) {
    try {
      const { result, successful } = await PingCallbackService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betMakeCallback (req, res, next) {
    try {
      const { result, successful } = await BetMakeCallbackService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async getUserToken (req, res, next) {
    try {
      const { result, successful } = await CreateUserTokenService.execute(req.query, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async commitCallback (req, res, next) {
    try {
      const { result, successful } = await CommitCallbackService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betWinCallback (req, res, next) {
    try {
      const { result, successful } = await BetWinService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betSettlement (req, res, next) {
    try {
      const { result, successful } = await BetSettlementService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betLostCallback (req, res, next) {
    try {
      const { result, successful } = await BetLostService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betDiscardCallback (req, res, next) {
    try {
      const { result, successful } = await BetDiscardService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betRefundCallback (req, res, next) {
    try {
      const { result, successful } = await BetRefundService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }

  static async betRollbackCallback (req, res, next) {
    try {
      const { result, successful } = await BetRollbackService.execute(req.body, req.context)
      sendBetbyCallbackResponse({ req, res, next }, { result, successful })
    } catch (error) {
      return res.status(BETBY_ERROR_CODES.UNKNOWN_ERROR).json(BETBY_UNKNOWN_ERROR_RESPONSE)
    }
  }
}

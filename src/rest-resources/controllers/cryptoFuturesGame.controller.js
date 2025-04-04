import { sendResponse } from '../../helpers/response.helpers'
import CashOutCryptoFuturesBet from '../../services/game/cryptoFutures/cashOutCryptoFuturesBet'
import GetCryptoFuturesBetsService from '../../services/game/cryptoFutures/getCryptoFutureBets.service'
import GetCryptoFuturesGraphService from '../../services/game/cryptoFutures/getCryptoFuturesGraph.service'
import GetCryptoFuturesGameInstruments from '../../services/game/cryptoFutures/getCryptoFuturesInstruments.service'
import PlaceCryptoFuturesBetService from '../../services/game/cryptoFutures/placeCryptoFuturesBet.service'
import UpdateCryptoFuturesBetToAutoBet from '../../services/game/cryptoFutures/updateCryptoFuturesBetToAutoBet.service'

/**
 * Crypto Futures Game Controller for handling all the request of /crypto-futures-game path
 *
 * @export
 * @class CryptoFuturesGameController
 */
export default class CryptoFuturesGameController {
  static async instruments (req, res, next) {
    try {
      const { result, successful, errors } = await GetCryptoFuturesGameInstruments.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async placeBet (req, res, next) {
    try {
      const { result, successful, errors } = await PlaceCryptoFuturesBetService.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async graph (req, res, next) {
    try {
      const { result, successful, errors } = await GetCryptoFuturesGraphService.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async getAllBets (req, res, next) {
    try {
      const { result, successful, errors } = await GetCryptoFuturesBetsService.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async cashOut (req, res, next) {
    try {
      const { result, successful, errors } = await CashOutCryptoFuturesBet.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }

  static async updateBet (req, res, next) {
    try {
      const { result, successful, errors } = await UpdateCryptoFuturesBetToAutoBet.execute({ ...req.query, ...req.body }, req.context)
      sendResponse({ req, res, next }, { result, successful, serviceErrors: errors })
    } catch (error) {
      next(error)
    }
  }
}

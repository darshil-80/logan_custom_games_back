import express from 'express'
import FlipCoinGameController from '../../../controllers/flipCoinGame.controller'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const flipCoinGameRoutes = express.Router()

flipCoinGameRoutes.route('/place-bet').post(
  FlipCoinGameController.placeBet, 
  responseValidationMiddleware()
)

export default flipCoinGameRoutes

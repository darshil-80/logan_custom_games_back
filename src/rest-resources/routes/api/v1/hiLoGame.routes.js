import express from 'express'
import HiLoGameController from '../../../controllers/hiLoGame.controller'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const hiLoGameRoutes = express.Router()

hiLoGameRoutes
  .route('/place-bet')
  .post(
    HiLoGameController.placeBet,
    responseValidationMiddleware()
  )
hiLoGameRoutes
  .route('/cash-out-bet')
  .post(
    HiLoGameController.cashOutBet,
    responseValidationMiddleware()
  )
hiLoGameRoutes
  .route('/open-card')
  .post(
    HiLoGameController.openCard,
    responseValidationMiddleware()
  )
hiLoGameRoutes
  .route('/unfinished-bet')
  .get(
    HiLoGameController.currentBetState,
    responseValidationMiddleware()
  )

export default hiLoGameRoutes

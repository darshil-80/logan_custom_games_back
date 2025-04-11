import express from 'express'
import MineGameController from '../../../controllers/mineGame.controller'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const mineGameRoutes = express.Router()

// place-bet route
mineGameRoutes
  .route('/place-bet').post(
    MineGameController.placeBet,
    responseValidationMiddleware()
  )

// open-tile route
mineGameRoutes
  .route('/open-tile').post(
    MineGameController.openTile,
    responseValidationMiddleware()
  )

// cash-out-bet route
mineGameRoutes
  .route('/cash-out-bet').post(
    MineGameController.cashOutBet,
    responseValidationMiddleware()
  )

// auto-bet route
mineGameRoutes
  .route('/auto-bet').post(
    MineGameController.autoBet,
    responseValidationMiddleware()
  )

// get-previous-round-state route
mineGameRoutes
  .route('/get-unfinished-bet-state').get(
    MineGameController.getUnfinishedGameState,
    responseValidationMiddleware()
  )

export default mineGameRoutes

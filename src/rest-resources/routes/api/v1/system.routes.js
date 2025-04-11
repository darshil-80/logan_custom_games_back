import express from 'express'
import SystemController from '../../../controllers/system.controller'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const systemRoutes = express.Router()
// get-game-settings route
systemRoutes.route('/get-game-settings').get(
  SystemController.getGameSettings,
  responseValidationMiddleware()
)

export default systemRoutes

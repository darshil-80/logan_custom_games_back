import express from 'express'
import UserController from '../../../controllers/user.controller'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const userRoutes = express.Router()

// user-detail route
userRoutes
  .route('/user-detail')
  .get(
    UserController.getUserDetail,
    responseValidationMiddleware()
  )

export default userRoutes

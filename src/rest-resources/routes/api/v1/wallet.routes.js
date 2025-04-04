import express from 'express'
import WalletController from '../../../controllers/wallet.controller'
import contextMiddleware from '../../../middlewares/context.middleware'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'

const walletRoutes = express.Router()

walletRoutes
  .route('/deposit-amount')
  .post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(),
    WalletController.gogopayCreateDeposit,
    responseValidationMiddleware()
  )

walletRoutes
  .route('/withdraw-amount')
  .post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(),
    WalletController.gogopayCreateWithdraw,
    responseValidationMiddleware()
  )

walletRoutes
  .route('/deposit-status')
  .get(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(),
    WalletController.depositStatus,
    responseValidationMiddleware()
  )

walletRoutes
  .route('/withdraw-status')
  .get(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(),
    WalletController.withdrawStatus,
    responseValidationMiddleware()
  )

walletRoutes
  .route('/generate-address')
  .post(
    contextMiddleware(true),
    authenticationMiddleWare,
    WalletController.generateAddress,
    responseValidationMiddleware()
  )

walletRoutes
  .route('/withdraw-request')
  .post(
    contextMiddleware(true),
    authenticationMiddleWare,
    WalletController.withdrawRequest,
    responseValidationMiddleware()
  )

export default walletRoutes

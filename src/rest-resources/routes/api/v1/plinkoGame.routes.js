import express from 'express'
import contextMiddleware from '../../../middlewares/context.middleware'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'
import PlinkoGameController from '../../../controllers/plinkoGame.controller'

const plinkoGameRoutes = express.Router()

const postPlaceBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      numberOfRows: { $ref: '/plinkoGameBet.json#/properties/numberOfRows' },
      riskLevel: { $ref: '/plinkoGameBet.json#/properties/riskLevel' },
      betAmount: { $ref: '/plinkoGameBet.json#/properties/betAmount' },
      clientSeed: { $ref: '/plinkoGameBet.json#/properties/clientSeed' },
      currencyId: { $ref: '/plinkoGameBet.json#/properties/currencyId' },
      isLightningMode: { $ref: '/plinkoGameBet.json#/properties/isLightningMode' },
      demo: { $ref: '/plinkoGameBet.json#/properties/demo' },
      demoAmount: { $ref: '/plinkoGameBet.json#/properties/demoAmount' }
    },
    required: ['numberOfRows', 'riskLevel', 'clientSeed', 'betAmount', 'isLightningMode', 'currencyId', 'demo']
  },
  responseSchema: {
    default: {
      $ref: '/plinkoGameBet.json'
    }
  }
}

const getMyBetsSchemas = {
  querySchema: {
    type: 'object',
    properties: {
      limit: { type: 'number' },
      offset: { type: 'number' }
    },
    required: ['limit', 'offset']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        rows: {
          type: 'array',
          items: {
            $ref: '/plinkoGameBet.json'
          }
        }
      }
    }
  }
}

const checkFairnessSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      clientSeed: { type: 'string' },
      serverSeed: { type: 'string' },
      numberOfRows: { type: 'number' },
      riskLevel: { type: 'number' }
    },
    required: ['clientSeed', 'serverSeed', 'numberOfRows', 'riskLevel']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        multiplier: { type: 'number' }
      }
    }
  }
}

// my-bets route
plinkoGameRoutes
  .route('/my-bets').get(
    contextMiddleware(false),
    authenticationMiddleWare,
    PlinkoGameController.getBets,
    responseValidationMiddleware(getMyBetsSchemas)
  )

// place-bet route
plinkoGameRoutes
  .route('/place-bet').post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postPlaceBetSchemas),
    PlinkoGameController.placeBet,
    responseValidationMiddleware(postPlaceBetSchemas)
  )

// post-lightning-mode route
plinkoGameRoutes
  .route('/lightning-board-details').post(
    contextMiddleware(true),
    requestValidationMiddleware(),
    PlinkoGameController.postLightningBoardDetails,
    responseValidationMiddleware()
  )

plinkoGameRoutes.route('/check-fairness').post(
  requestValidationMiddleware(checkFairnessSchemas),
  contextMiddleware(true),
  PlinkoGameController.checkFairness,
  responseValidationMiddleware(checkFairnessSchemas)
)
export default plinkoGameRoutes

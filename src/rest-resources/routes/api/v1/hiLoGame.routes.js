import express from 'express'
import HiLoGameController from '../../../controllers/hiLoGame.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import contextMiddleware from '../../../middlewares/context.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const hiLoGameRoutes = express.Router()

const postPlaceBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      initialCard: { $ref: '/hiLoGameBet.json#/properties/initialCard' },
      betAmount: { $ref: '/hiLoGameBet.json#/properties/betAmount' },
      clientSeed: { $ref: '/hiLoGameBet.json#/properties/clientSeed' },
      currencyId: { $ref: '/hiLoGameBet.json#/properties/currencyId' },
      demo: { $ref: '/hiLoGameBet.json#/properties/demo' },
      demoAmount: { $ref: '/hiLoGameBet.json#/properties/demoAmount' }
    },
    required: ['initialCard', 'clientSeed', 'betAmount', 'currencyId']
  },
  responseSchema: {
    default: {
      $ref: '/hiLoGameBet.json'
    }
  }
}

const postOpenCardSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      betType: { $ref: '/hiLoGameBetState.json#/properties/betType' },
      currencyId: { $ref: '/hiLoGameBet.json#/properties/currencyId' },
      demo: { $ref: '/hiLoGameBet.json#/properties/demo' },
      demoAmount: { $ref: '/hiLoGameBet.json#/properties/demoAmount' }
    },
    required: ['betType', 'currencyId']
  },
  responseSchema: {
    default: {
      $ref: '/hiLoGameBet.json'
    }
  }
}

const postCashOutBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      currencyId: { $ref: '/hiLoGameBet.json#/properties/currencyId' },
      demo: { $ref: '/hiLoGameBet.json#/properties/demo' },
      demoAmount: { $ref: '/hiLoGameBet.json#/properties/demoAmount' }
    },
    required: ['currencyId']
  },
  responseSchema: {
    default: {
      $ref: '/hiLoGameBet.json'
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
            $ref: '/hiLoGameBet.json'
          }
        }
      }
    }
  }
}

const getUnfinishedBetSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        hasUnfinishedBet: { type: 'boolean' },
        unfinishedBet: {
          $ref: '/hiLoGameBet.json'
        }
      },
      required: ['hasUnfinishedBet']
    }
  }
}

const checkFairnessSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      clientSeed: { type: 'string' },
      serverSeed: { type: 'string' }
    },
    required: ['clientSeed', 'serverSeed']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        shuffledDeck: { type: 'array' }
      }
    }
  }
}

hiLoGameRoutes
  .route('/place-bet')
  .post(contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postPlaceBetSchemas),
    HiLoGameController.placeBet,
    responseValidationMiddleware(postPlaceBetSchemas)
  )
hiLoGameRoutes
  .route('/cash-out-bet')
  .post(contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postCashOutBetSchemas),
    HiLoGameController.cashOutBet,
    responseValidationMiddleware(postCashOutBetSchemas)
  )
hiLoGameRoutes
  .route('/open-card')
  .post(contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postOpenCardSchemas),
    HiLoGameController.openCard,
    responseValidationMiddleware(postOpenCardSchemas)
  )
hiLoGameRoutes
  .route('/my-bets')
  .get(contextMiddleware(false),
    authenticationMiddleWare,
    requestValidationMiddleware(getMyBetsSchemas),
    HiLoGameController.getMyBets,
    responseValidationMiddleware(getMyBetsSchemas)
  )
hiLoGameRoutes
  .route('/unfinished-bet')
  .get(contextMiddleware(false),
    authenticationMiddleWare,
    HiLoGameController.currentBetState,
    responseValidationMiddleware(getUnfinishedBetSchemas)
  )
hiLoGameRoutes
  .route('/check-fairness')
  .post(
    requestValidationMiddleware(checkFairnessSchemas),
    contextMiddleware(true),
    HiLoGameController.checkFairness,
    responseValidationMiddleware(checkFairnessSchemas)
  )

export default hiLoGameRoutes

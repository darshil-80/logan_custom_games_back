import express from 'express'
import FlipCoinGameController from '../../../controllers/flipCoinGame.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import contextMiddleware from '../../../middlewares/context.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const flipCoinGameRoutes = express.Router()

const postPlaceBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      numberOfCoins: { $ref: '/flipCoinGameBet.json#/properties/numberOfCoins' },
      minimumChosenOutcome: { $ref: '/flipCoinGameBet.json#/properties/minimumChosenOutcome' },
      heads: { $ref: '/flipCoinGameBet.json#/properties/heads' },
      betAmount: { $ref: '/flipCoinGameBet.json#/properties/betAmount' },
      clientSeed: { $ref: '/flipCoinGameBet.json#/properties/clientSeed' },
      currencyId: { $ref: '/flipCoinGameBet.json#/properties/currencyId' },
      demo: { $ref: '/flipCoinGameBet.json#/properties/demo' },
      demoAmount: { $ref: '/flipCoinGameBet.json#/properties/demoAmount' }
    },
    required: ['numberOfCoins', 'minimumChosenOutcome', 'heads', 'clientSeed', 'betAmount', 'currencyId']
  },
  responseSchema: {
    default: {
      $ref: '/flipCoinGameBet.json'
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
            $ref: '/flipCoinGameBet.json'
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
      numberOfCoins: { type: 'number' }
    },
    required: ['clientSeed', 'serverSeed', 'numberOfCoins']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        result: { type: 'string' }
      }
    }
  }
}

flipCoinGameRoutes.route('/place-bet').post(contextMiddleware(true), authenticationMiddleWare, requestValidationMiddleware(postPlaceBetSchemas), FlipCoinGameController.placeBet, responseValidationMiddleware(postPlaceBetSchemas))
flipCoinGameRoutes.route('/my-bets').get(contextMiddleware(false), authenticationMiddleWare, requestValidationMiddleware(getMyBetsSchemas), FlipCoinGameController.getMyBets, responseValidationMiddleware(getMyBetsSchemas))
flipCoinGameRoutes.route('/check-fairness').post(requestValidationMiddleware(checkFairnessSchemas), contextMiddleware(true), authenticationMiddleWare, FlipCoinGameController.checkFairness, responseValidationMiddleware(checkFairnessSchemas)
)
export default flipCoinGameRoutes

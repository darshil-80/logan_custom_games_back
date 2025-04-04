import express from 'express'
import contextMiddleware from '../../../middlewares/context.middleware'
import DiceGameController from '../../../controllers/diceGame.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const diceGameRoutes = express.Router()

const getBetsSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                $ref: '/diceGameBet.json#/properties/id'
              },
              betAmount: {
                type: 'string'
              },
              winningAmount: {
                type: 'string'
              },
              result: {
                type: 'string'
              },
              number: {
                type: 'number'
              },
              winningNumber: {
                type: 'number'
              },
              rollOver: {
                type: 'boolean'
              },
              currencyId: {
                type: 'string'
              },
              createdAt: {
                $ref: '/diceGameBet.json#/properties/createdAt'
              },
              updatedAt: {
                $ref: '/diceGameBet.json#/properties/updatedAt'
              },
              multiplier: {
                type: 'number'
              }
            }
          }
        }
      }
    }
  }
}

const placeBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      number: { $ref: '/diceGameBet.json#/properties/number' },
      currencyId: { $ref: '/wallet.json#/properties/currencyId' },
      rollOver: { $ref: '/diceGameBet.json#/properties/rollOver' },
      betAmount: { $ref: '/diceGameBet.json#/properties/betAmount' },
      clientSeed: { $ref: '/diceGameBet.json#/properties/clientSeed' },
      demoAmount: { type: 'number' }
    },
    required: ['number', 'rollOver', 'clientSeed', 'betAmount', 'currencyId']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: {
          $ref: '/diceGameBet.json#/properties/id'
        },
        betAmount: {
          type: 'string'
        },
        winningAmount: {
          type: 'string'
        },
        result: {
          type: 'string'
        },
        number: {
          type: 'number'
        },
        winningNumber: {
          type: 'number'
        },
        rollOver: {
          type: 'boolean'
        },
        currencyId: {
          type: 'string'
        },
        createdAt: {
          $ref: '/diceGameBet.json#/properties/createdAt'
        },
        updatedAt: {
          $ref: '/diceGameBet.json#/properties/updatedAt'
        },
        clientSeed: {
          $ref: '/diceGameBet.json#/properties/clientSeed'
        },
        serverSeed: {
          $ref: '/diceGameBet.json#/properties/serverSeed'
        },
        nextServerSeedHash: {
          $ref: '/diceGameBet.json#/properties/nextServerSeedHash'
        },
        demo: {
          type: 'boolean'
        },
        demoAmount: {
          type: 'number'
        },
        multiplier: {
          type: 'number'
        }
      }
    }
  }
}

// get-bets route
diceGameRoutes
  .route('/get-bets').get(
    contextMiddleware(false),
    authenticationMiddleWare,
    DiceGameController.getBets,
    responseValidationMiddleware(getBetsSchemas)
  )

// place-bet route
diceGameRoutes
  .route('/place-bet').post(
    contextMiddleware(true),
    requestValidationMiddleware(placeBetSchemas),
    authenticationMiddleWare,
    DiceGameController.placeBet,
    responseValidationMiddleware(placeBetSchemas)
  )

diceGameRoutes
  .route('/check-fairness').post(
    contextMiddleware(true),
    requestValidationMiddleware(),
    authenticationMiddleWare,
    DiceGameController.checkFairness,
    responseValidationMiddleware()
  )
export default diceGameRoutes

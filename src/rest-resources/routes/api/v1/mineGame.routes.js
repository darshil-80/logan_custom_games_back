import express from 'express'
import contextMiddleware from '../../../middlewares/context.middleware'
import MineGameController from '../../../controllers/mineGame.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'
import { MAX_TILE_COUNT, MIN_TILE_COUNT } from '../../../../libs/constants'

const mineGameRoutes = express.Router()

const getBetsSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        rows: {
          type: 'array',
          items: {
            $ref: '/mineGameBet.json'
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
      mineCount: { $ref: '/mineGameBet.json#/properties/mineCount' },
      betAmount: { $ref: '/mineGameBet.json#/properties/betAmount' },
      clientSeed: { $ref: '/mineGameBet.json#/properties/clientSeed' },
      currencyId: { $ref: '/wallet.json#/properties/currencyId' }
    },
    required: ['mineCount', 'clientSeed', 'betAmount', 'currencyId']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        mineCount: { type: 'number' },
        betAmount: { type: 'string' },
        clientSeed: { type: ['string'] },
        currencyId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
}

const autoBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      mineCount: { $ref: '/mineGameBet.json#/properties/mineCount' },
      betAmount: { $ref: '/mineGameBet.json#/properties/betAmount' },
      clientSeed: { $ref: '/mineGameBet.json#/properties/clientSeed' },
      tiles: { type: 'array', uniqueItems: true, minItems: 1, items: { type: 'number', minimum: MIN_TILE_COUNT, maximum: MAX_TILE_COUNT } },
      currencyId: { $ref: '/wallet.json#/properties/currencyId' }
    },
    required: ['mineCount', 'clientSeed', 'betAmount', 'tiles', 'currencyId']
  },
  responseSchema: {
    default: {
      $ref: '/mineGameBet.json'
    }
  }
}

const openTileSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      tile: { type: 'number' }
    },
    required: ['tile']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        mineTile: { type: 'boolean' },
        id: { type: 'string' },
        userId: { type: 'string' },
        mineCount: { type: 'number' },
        mineTiles: { type: 'array' },
        betAmount: { type: 'string' },
        winningAmount: { type: 'string' },
        result: { type: ['string'] },
        clientSeed: { type: ['string'] },
        serverSeed: { type: ['string'] },
        nextServerSeedHash: { type: 'string' },
        currencyId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      },
      required: ['mineTile']
    }
  }
}

const cashOutBetSchema = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: {
          $ref: '/mineGameBet.json#/properties/id'
        },
        betAmount: {
          type: 'string'
        },
        winningAmount: {
          type: 'number'
        },
        mineCount: {
          type: 'number'
        },
        mineTiles: {
          type: 'array'
        },
        result: {
          type: 'string'
        },
        currencyId: {
          type: 'string'
        },
        clientSeed: {
          $ref: '/mineGameBet.json#/properties/clientSeed'
        },
        serverSeed: {
          $ref: '/mineGameBet.json#/properties/serverSeed'
        },
        nextServerSeedHash: { type: 'string' },
        createdAt: {
          $ref: '/mineGameBet.json#/properties/createdAt'
        },
        updatedAt: {
          $ref: '/mineGameBet.json#/properties/updatedAt'
        }
      }
    }
  }
}

const getUnfinishedGameStateSchema = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        hasUnfinishedGame: { type: 'boolean' },
        unfinishedGameBetDetails: {
          $ref: '/mineGameBet.json'
        }
      }
    }
  }
}

const postCheckProvableFair = {
  bodySchema: {
    type: 'object',
    properties: {
      clientSeed: { $ref: '/mineGameBet.json#/properties/clientSeed' },
      serverSeed: { $ref: '/mineGameBet.json#/properties/serverSeed' },
      mines: { type: 'array', items: { type: 'number' } }
    }
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        clientSeed: { $ref: '/mineGameBet.json#/properties/clientSeed' },
        serverSeed: { $ref: '/mineGameBet.json#/properties/serverSeed' },
        mines: { type: 'array', items: { type: 'number' } }
      }
    }
  }
}

const getTopBets = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        topBets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              totalBetAmount: { type: 'string' },
              totalWinAmount: { type: 'string' }
            }
          }
        }
      }
    }
  }
}

const getLiveStats = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        statistics: {
          type: 'object',
          properties: {
            totalProfit: { type: 'number' },
            totalWagered: { type: 'number' },
            totalWins: { type: 'number' },
            totalLost: { type: 'number' }
          }
        }
      }
    }
  }
}

// get-bets route
// mineGameRoutes
//   .route('/get-bets').get(
//     contextMiddleware(false),
//     authenticationMiddleWare,
//     MineGameController.getBets,
//     responseValidationMiddleware(getBetsSchemas)
//   )

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
    // contextMiddleware(true),
    // authenticationMiddleWare,
    MineGameController.cashOutBet,
    responseValidationMiddleware()
  )

// auto-bet route
mineGameRoutes
  .route('/auto-bet').post(
    // contextMiddleware(true),
    // authenticationMiddleWare,
    // requestValidationMiddleware(autoBetSchemas),
    MineGameController.autoBet,
    // responseValidationMiddleware(autoBetSchemas),
    responseValidationMiddleware()
  )

// get-previous-round-state route
mineGameRoutes
  .route('/get-unfinished-bet-state').get(
    MineGameController.getUnfinishedGameState,
    responseValidationMiddleware()
  )

// // post-check-provable-fair route
// mineGameRoutes
//   .route('/check-fairness').post(
//     contextMiddleware(false),
//     requestValidationMiddleware(postCheckProvableFair),
//     authenticationMiddleWare,
//     MineGameController.checkProvableFair,
//     responseValidationMiddleware(postCheckProvableFair)
//   )

// // get-top-bets route
// mineGameRoutes
//   .route('/top-bets').get(
//     contextMiddleware(false),
//     MineGameController.topBets,
//     responseValidationMiddleware(getTopBets)
//   )

// // get-live-stats route
// mineGameRoutes
//   .route('/live-stats').get(
//     contextMiddleware(false),
//     requestValidationMiddleware(getLiveStats),
//     MineGameController.liveStats,
//     responseValidationMiddleware(getLiveStats)
//   )

export default mineGameRoutes

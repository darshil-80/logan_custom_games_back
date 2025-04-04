import express from 'express'
import contextMiddleware from '../../../middlewares/context.middleware'
import BlackJackGameController from '../../../controllers/blackJackGame.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const blackJackGameRoutes = express.Router()

const postPlaceBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      betAmount: { type: 'number' },
      currencyId: { type: 'string' },
      clientSeed: { type: 'string' }
    },
    required: ['betAmount', 'currencyId', 'clientSeed']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        playerHand: { type: 'array' },
        playersPoint: { type: 'number' },
        playersAcePoint: { type: 'number' },
        dealerHand: { type: 'array' },
        gameResult: { type: ['string', 'null'] },
        result: { type: ['string', 'null'] },
        double: { type: 'boolean' },
        split: { type: 'boolean' },
        nextServerSeedHash: { type: 'string' }
      }
    }
  }
}

const postHitSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      betId: { type: 'number' }
    },
    required: ['betId']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        playerHand: { type: 'array' },
        playersPoint: { type: 'number' },
        playersAcePoint: { type: 'number' },
        dealerHand: { type: 'array' },
        gameResult: { type: ['string', 'null'] },
        result: { type: ['string', 'null'] },
        winningAmount: { type: 'number' },
        dealersPoint: { type: 'number' },
        dealersAcePoint: { type: 'number' }
      }
    }
  }
}

const postStandSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      betId: { type: 'number' }
    },
    required: ['betId']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        playerHand: { type: 'array' },
        playersPoint: { type: 'number' },
        playersAcePoint: { type: 'number' },
        dealerHand: { type: 'array' },
        gameResult: { type: ['string', 'null'] },
        result: { type: ['string', 'null'] },
        isDouble: { type: 'boolean' },
        winningAmount: { type: 'string' },
        dealersPoint: { type: 'number' },
        dealersAcePoint: { type: 'number' },
        isSplit: { type: 'boolean' },
        betAmount: { type: 'string' },
        parentBetId: { type: ['string', 'null'] },
        roundId: { type: 'string' },
        currencyId: { type: 'string' },
        currentGameSettings: { type: 'string' },
        clientSeed: { type: 'string' },
        serverSeed: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
}

const postDoubleBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      betId: { type: 'number' }
    },
    required: ['betId']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'string' },
        playerHand: { type: 'array' },
        playersPoint: { type: 'number' },
        playersAcePoint: { type: 'number' },
        dealerHand: { type: 'array' },
        gameResult: { type: ['string', 'null'] },
        result: { type: ['string', 'null'] },
        isDouble: { type: 'boolean' },
        winningAmount: { type: 'number' },
        dealersPoint: { type: 'number' },
        dealersAcePoint: { type: 'number' },
        isSplit: { type: 'boolean' },
        betAmount: { type: 'string' },
        parentBetId: { type: ['string', 'null'] },
        roundId: { type: 'string' },
        currencyId: { type: 'string' },
        currentGameSettings: { type: 'string' },
        clientSeed: { type: 'string' },
        serverSeed: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
}

const postSplitBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      betId: { type: 'number' }
    },
    required: ['betId']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        userId: { type: 'string' },
        playerHand: { type: 'array' },
        playersPoint: { type: 'number' },
        playersAcePoint: { type: 'number' },
        dealerHand: { type: 'array' },
        gameResult: { type: ['string', 'null'] },
        result: { type: ['string', 'null'] },
        isDouble: { type: 'boolean' },
        winningAmount: { type: 'number' },
        dealersPoint: { type: 'number' },
        dealersAcePoint: { type: 'number' },
        isSplit: { type: 'boolean' },
        betAmount: { type: 'string' },
        parentBetId: { type: ['string', 'null'] },
        roundId: { type: 'string' },
        currencyId: { type: 'string' },
        currentGameSettings: { type: 'string' },
        clientSeed: { type: 'string' },
        serverSeed: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }
}

// get-bets route
blackJackGameRoutes
  .route('/get-bets').get(
    contextMiddleware(false),
    authenticationMiddleWare,
    BlackJackGameController.getBets,
    responseValidationMiddleware()
  )

// place-bet route
blackJackGameRoutes
  .route('/place-bet').post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postPlaceBetSchemas),
    BlackJackGameController.placeBet,
    responseValidationMiddleware(postPlaceBetSchemas)
  )

// hit route
blackJackGameRoutes
  .route('/hit').post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postHitSchemas),
    BlackJackGameController.hit,
    responseValidationMiddleware(postHitSchemas)
  )

// Stand route
blackJackGameRoutes
  .route('/stand').post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postStandSchemas),
    BlackJackGameController.stand,
    responseValidationMiddleware()
  )

// Double Bet Route
blackJackGameRoutes
  .route('/double-bet').post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postDoubleBetSchemas),
    BlackJackGameController.doubleBet,
    responseValidationMiddleware(postDoubleBetSchemas)
  )

// Split Bet Route
blackJackGameRoutes
  .route('/split-bet').post(
    contextMiddleware(true),
    authenticationMiddleWare,
    requestValidationMiddleware(postSplitBetSchemas),
    BlackJackGameController.splitBet,
    responseValidationMiddleware()
  )

export default blackJackGameRoutes

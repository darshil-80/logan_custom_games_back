import express from 'express'
import { TOP_BET_TYPE } from '../../../../libs/constants'
import contextMiddleware from '../../../middlewares/context.middleware'
import CrashGameController from '../../../controllers/crashGame.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const crashGameRoutes = express.Router()

const getCrashGameGetStatusSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        previousRounds: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { $ref: '/crashGameRoundDetail.json#/properties/id' },
              roundId: {
                $ref: '/crashGameRoundDetail.json#/properties/roundId'
              },
              roundState: {
                $ref: '/crashGameRoundDetail.json#/properties/roundState'
              },
              crashRate: {
                $ref: '/crashGameRoundDetail.json#/properties/crashRate'
              },
              roundSignature: {
                $ref: '/crashGameRoundDetail.json#/properties/roundSignature'
              },
              roundHash: {
                $ref: '/crashGameRoundDetail.json#/properties/roundHash'
              },
              createdAt: {
                $ref: '/crashGameRoundDetail.json#/properties/createdAt'
              },
              onHoldAt: {
                $ref: '/crashGameRoundDetail.json#/properties/onHoldAt'
              },
              bets: { $ref: '/crashGameBet.json#' }
            }
          }
        },
        currentRound: {
          type: 'object',
          properties: {
            id: { $ref: '/crashGameRoundDetail.json#/properties/id' },
            roundId: {
              $ref: '/crashGameRoundDetail.json#/properties/roundId'
            },
            roundState: {
              $ref: '/crashGameRoundDetail.json#/properties/roundState'
            },
            roundSignature: {
              $ref: '/crashGameRoundDetail.json#/properties/roundSignature'
            },
            createdAt: {
              $ref: '/crashGameRoundDetail.json#/properties/createdAt'
            },
            onHoldAt: {
              $ref: '/crashGameRoundDetail.json#/properties/onHoldAt'
            }
          }
        },
        topWinners: {
          $ref: '/crashGameBet.json#'
        }
      }
    }
  }
}

const getGetCrashGameRoundDetailSchemas = {
  responseSchema: {
    default: {
      $ref: '/crashGameRoundDetail.json#'
    }
  }
}

const getGetCrashGameHistorySchemas = {
  querySchema: {
    type: 'object',
    properties: {
      limit: { type: 'string', default: '10' },
      offset: { type: 'string', default: '0' }
    }
  },
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
              id: { $ref: '/crashGameRoundDetail.json#/properties/id' },
              roundId: { $ref: '/crashGameRoundDetail.json#/properties/roundId' },
              roundState: {
                $ref: '/crashGameRoundDetail.json#/properties/roundState'
              },
              crashRate: {
                $ref: '/crashGameRoundDetail.json#/properties/crashRate'
              },
              roundSignature: {
                $ref: '/crashGameRoundDetail.json#/properties/roundSignature'
              },
              roundHash: {
                $ref: '/crashGameRoundDetail.json#/properties/roundHash'
              },
              createdAt: {
                $ref: '/crashGameRoundDetail.json#/properties/createdAt'
              },
              bets: { $ref: '/crashGameBet.json#' }
            }
          }
        }
      }
    }
  }
}

const postPlaceCrashGameBetSchemas = {
  bodySchema: {
    type: 'object',
    properties: {
      autoRate: { $ref: '/crashGameBet.json#/properties/autoRate' },
      betAmount: { $ref: '/crashGameBet.json#/properties/betAmount' },
      currencyId: { $ref: '/crashGameBet.json#/properties/currencyId' }
    },
    required: ['autoRate', 'betAmount', 'currencyId']
  },
  responseSchema: {
    default: {
      $ref: '/crashGameBet.json#'
    }
  }
}

const getMyBetsSchemas = {
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
              id: { $ref: '/crashGameBet.json#/properties/id' },
              betAmount: {
                $ref: '/crashGameBet.json#/properties/betAmount'
              },
              winningAmount: {
                $ref: '/crashGameBet.json#/properties/winningAmount'
              },
              result: { $ref: '/crashGameBet.json#/properties/result' },
              autoRate: {
                $ref: '/crashGameBet.json#/properties/autoRate'
              },
              escapeRate: {
                $ref: '/crashGameBet.json#/properties/escapeRate'
              },
              currencyId: {
                $ref: '/crashGameBet.json#/properties/currencyId'
              },
              createdAt: {
                $ref: '/crashGameBet.json#/properties/createdAt'
              },
              updatedAt: {
                $ref: '/crashGameBet.json#/properties/updatedAt'
              },
              crashGameRoundDetail: {
                type: 'object',
                properties: {
                  id: {
                    $ref: '/crashGameRoundDetail.json#/properties/id'
                  },
                  roundId: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundId'
                  },
                  crashRate: {
                    $ref: '/crashGameRoundDetail.json#/properties/crashRate'
                  },
                  roundHash: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundHash'
                  },
                  createdAt: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundId'
                  },
                  updatedAt: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundId'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const getTopBetsSchemas = {
  querySchema: {
    type: 'object',
    properties: {
      limit: { type: 'string', default: '10' },
      offset: { type: 'string', default: '00' },
      type: { type: 'string', enum: [TOP_BET_TYPE.BIGGEST_WIN, TOP_BET_TYPE.HUGE_WIN, TOP_BET_TYPE.MULTIPLIER] }
    },
    required: ['type']
  },
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
              id: { $ref: '/crashGameBet.json#/properties/id' },
              betAmount: {
                $ref: '/crashGameBet.json#/properties/betAmount'
              },
              winningAmount: {
                $ref: '/crashGameBet.json#/properties/winningAmount'
              },
              result: { $ref: '/crashGameBet.json#/properties/result' },
              autoRate: {
                $ref: '/crashGameBet.json#/properties/autoRate'
              },
              escapeRate: {
                $ref: '/crashGameBet.json#/properties/escapeRate'
              },
              currencyId: {
                $ref: '/crashGameBet.json#/properties/currencyId'
              },
              profit: { type: 'number' },
              user: {
                type: 'object',
                properties: {
                  firstName: { $ref: '/user.json#/properties/firstName' },
                  lastName: { $ref: '/user.json#/properties/lastName' },
                  userName: { $ref: '/user.json#/properties/userName' },
                  ethereumAddress: {
                    $ref: '/user.json#/properties/ethereumAddress'
                  }
                }
              },
              crashGameRoundDetail: {
                type: 'object',
                properties: {
                  id: {
                    $ref: '/crashGameRoundDetail.json#/properties/id'
                  },
                  roundId: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundId'
                  },
                  crashRate: {
                    $ref: '/crashGameRoundDetail.json#/properties/crashRate'
                  },
                  roundHash: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundHash'
                  },
                  roundSignature: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundSignature'
                  },
                  createdAt: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundId'
                  },
                  updatedAt: {
                    $ref: '/crashGameRoundDetail.json#/properties/roundId'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const getAllBetsSchemas = {
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
              id: { $ref: '/crashGameBet.json#/properties/id' },
              betAmount: {
                $ref: '/crashGameBet.json#/properties/betAmount'
              },
              winningAmount: {
                $ref: '/crashGameBet.json#/properties/winningAmount'
              },
              result: { $ref: '/crashGameBet.json#/properties/result' },
              autoRate: {
                $ref: '/crashGameBet.json#/properties/autoRate'
              },
              escapeRate: {
                $ref: '/crashGameBet.json#/properties/escapeRate'
              },
              currencyId: {
                $ref: '/crashGameBet.json#/properties/currencyId'
              },
              user: {
                type: 'object',
                properties: {
                  firstName: { $ref: '/user.json#/properties/firstName' },
                  lastName: { $ref: '/user.json#/properties/lastName' },
                  userName: { $ref: '/user.json#/properties/userName' },
                  ethereumAddress: {
                    $ref: '/user.json#/properties/ethereumAddress'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
// get-crash-game-status route
// crashGameRoutes
//   .route('/get-crash-game-status').get(
//     contextMiddleware(false),
//     CrashGameController.CrashGameGetStatus,
//     responseValidationMiddleware(getCrashGameGetStatusSchemas)
//   )

// // get-crash-game-round-detail route
// crashGameRoutes
//   .route('/get-crash-game-round-detail').get(
//     contextMiddleware(false),
//     CrashGameController.getCrashGameRoundDetail,
//     responseValidationMiddleware(getGetCrashGameRoundDetailSchemas)
//   )

crashGameRoutes.get('/restart', CrashGameController.restartCrashGame)

// get-crash-game-history route
crashGameRoutes
  .route('/get-crash-game-history').get(
    // contextMiddleware(false),
    // requestValidationMiddleware(getGetCrashGameHistorySchemas),
    CrashGameController.getCrashGameHistory,
    responseValidationMiddleware()
  )

// place-bet-crash-game route
crashGameRoutes
  .route('/place-bet-crash-game').post(
    // contextMiddleware(true),
    // authenticationMiddleWare,
    // requestValidationMiddleware(postPlaceCrashGameBetSchemas),
    CrashGameController.placeBetCrashGame,
    responseValidationMiddleware()
  )

// cancel-bet-crash-game route
crashGameRoutes
  .route('/cancel-bet-crash-game')
  .post(
    // contextMiddleware(true),
    // authenticationMiddleWare,
    CrashGameController.cancelBetCrashGame,
    responseValidationMiddleware()
  )

// player-escape-crashGame route
crashGameRoutes
  .route('/player-escape-crashGame')
  .post(
    // contextMiddleware(true),
    // authenticationMiddleWare,
    CrashGameController.playerEscapeCrashGame,
    responseValidationMiddleware()
  )

// // get-my-bets route
// crashGameRoutes
//   .route('/my-bets')
//   .get(
//     contextMiddleware(false),
//     authenticationMiddleWare,
//     CrashGameController.myBets,
//     responseValidationMiddleware(getMyBetsSchemas)
//   )

// crashGameRoutes
//   .route('/top-bets')
//   .get(
//     contextMiddleware(false),
//     requestValidationMiddleware(getTopBetsSchemas),
//     CrashGameController.topBets,
//     responseValidationMiddleware(getTopBetsSchemas)
//   )

// crashGameRoutes
//   .route('/all-bets')
//   .get(
//     contextMiddleware(false),
//     CrashGameController.allBets,
//     responseValidationMiddleware(getAllBetsSchemas)
//   )

// crashGameRoutes
//   .route('/list-uplifting-words')
//   .get(
//     contextMiddleware(false),
//     CrashGameController.getAllUpliftingWords,
//     responseValidationMiddleware()
//   )
// // getRoundAllBets
// crashGameRoutes
//   .route('/all-placed-bets')
//   .get(
//     contextMiddleware(false),
//     CrashGameController.getAllPlacedBets,
//     responseValidationMiddleware()
//   )

// crashGameRoutes
//   .route('/check-provable-fair')
//   .post(
//     contextMiddleware(true),
//     CrashGameController.checkProvableFair,
//     responseValidationMiddleware()
//   )

// crashGameRoutes
//   .route('/get-all-round-placed-bets')
//   .get(
//     contextMiddleware(false),
//     CrashGameController.getAllRoundPlacedBets,
//     responseValidationMiddleware()
//   )
export default crashGameRoutes

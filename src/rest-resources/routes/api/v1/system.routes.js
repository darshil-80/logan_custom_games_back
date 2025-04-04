import express from 'express'
import SystemController from '../../../controllers/system.controller'
import authenticationMiddleWare from '../../../middlewares/authentication.middleware'
import contextMiddleware from '../../../middlewares/context.middleware'
import requestValidationMiddleware from '../../../middlewares/requestValidation.middleware'
import responseValidationMiddleware from '../../../middlewares/responseValidation.middleware'

const systemRoutes = express.Router()

const getGetBannersSchemas = {
  responseSchema: {
    default: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/banner.json#/properties/id' },
          name: { $ref: '/banner.json#/properties/name' },
          imageUrl: { $ref: '/banner.json#/properties/imageUrl' },
          redirectUrl: { $ref: '/banner.json#/properties/redirectUrl' },
          bannerType: { $ref: '/banner.json#/properties/bannerType' },
          order: { $ref: '/banner.json#/properties/order' },
          enabled: { $ref: '/banner.json#/properties/enabled' },
          isMobile: { $ref: '/banner.json#/properties/isMobile' },
          mobileImageUrl: { $ref: '/banner.json#/properties/mobileImageUrl' },
          createdAt: { $ref: '/banner.json#/properties/createdAt' },
          updatedAt: { $ref: '/banner.json#/properties/updatedAt' }
        }
      }
    }
  }
}

const getGetGameSettingsSchemas = {
  responseSchema: {
    default: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/gameSetting.json#/properties/id' },
          gameId: { $ref: '/gameSetting.json#/properties/gameId' },
          minBet: { $ref: '/gameSetting.json#/properties/minBet' },
          maxBet: { $ref: '/gameSetting.json#/properties/maxBet' },
          maxProfit: { $ref: '/gameSetting.json#/properties/maxProfit' },
          houseEdge: { $ref: '/gameSetting.json#/properties/houseEdge' },
          minOdds: { $ref: '/gameSetting.json#/properties/minOdds' },
          maxOdds: { $ref: '/gameSetting.json#/properties/maxOdds' },
          gameDetails: { $ref: '/gameSetting.json#/properties/gameDetails' },
          minAutoRate: { $ref: '/gameSetting.json#/properties/minAutoRate' },
          maxNumberOfAutoBets: { $ref: '/gameSetting.json#/properties/maxNumberOfAutoBets' },
          createdAt: { $ref: '/gameSetting.json#/properties/createdAt' },
          updatedAt: { $ref: '/gameSetting.json#/properties/updatedAt' }
        }
      }
    }
  }
}

const getGetAllCurrencySchemas = {
  responseSchema: {
    default: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/currency.json#/properties/id' },
          name: { $ref: '/currency.json#/properties/name' },
          code: { $ref: '/currency.json#/properties/code' },
          primary: { $ref: '/currency.json#/properties/primary' },
          exchangeRate: { $ref: '/currency.json#/properties/exchangeRate' },
          isFiat: { $ref: '/currency.json#/properties/isFiat' },
          units: { $ref: '/currency.json#/properties/units' },
          symbol: { $ref: '/currency.json#/properties/symbol' },
          createdAt: { $ref: '/currency.json#/properties/createdAt' },
          updatedAt: { $ref: '/currency.json#/properties/updatedAt' }
        }
      }
    }
  }
}

const getGetGameDetailsSchemas = {
  responseSchema: {
    default: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { $ref: '/games.json#/properties/id' },
          name: { $ref: '/games.json#/properties/name' },
          status: { $ref: '/games.json#/properties/status' },
          createdAt: { $ref: '/games.json#/properties/createdAt' },
          updatedAt: { $ref: '/games.json#/properties/updatedAt' }
        }
      }
    }
  }
}

const getTotalWinningAmountSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        totalWinningAmount: { type: 'number' }
      },
      required: ['totalWinningAmount']
    }
  }
}

const getTotalBetsSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        totalBets: { type: 'number' }
      },
      required: ['totalBets']
    }
  }
}

const startGameSchemas = {
  querySchema: {
    type: 'object',
    properties: {
      gameId: { type: 'string' },
      demo: { type: 'string' },
      lang: { type: 'string' },
      mobile: { type: 'string' }
    },
    required: ['gameId', 'demo']
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        link: {
          type: 'string'
        }
      }
    }
  }
}

const getChatRuleSchemas = {
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        rules: { type: 'array' },
        message: { type: 'string' }
      },
      required: ['message']
    }
  }
}

const getPromotionSchemas = {
  querySchema: {
    type: 'object',
    properties: {
      promotionId: { type: 'string' },
      limit: { type: 'string' },
      offset: { type: 'string' },
      search: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      status: { type: 'string' }
    }
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        count: { type: 'string' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              description: { type: 'string' },
              prize: { type: 'string' },
              imageBanner: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      },
      required: ['rows', 'count']
    }
  }
}

const getAnnouncementSchemas = {
  querySchema: {
    type: 'object',
    properties: {
      limit: { type: 'string' },
      offset: { type: 'string' },
      search: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      id: { type: 'string' },
      status: { type: 'string' },
      isPinned: { type: 'string' }
    }
  },
  responseSchema: {
    default: {
      type: 'object',
      properties: {
        count: { type: 'string' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'boolean' },
              description: { type: 'string' },
              isPinned: { type: 'boolean' },
              createdBy: { type: 'number' },
              updatedBy: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      },
      required: ['rows', 'count']
    }
  }
}

// get-game-settings route
systemRoutes.route('/get-game-settings').get(
  // contextMiddleware(false),
  SystemController.getGameSettings,
  responseValidationMiddleware()
)

export default systemRoutes

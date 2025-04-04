import ajv from '../../libs/ajv'
import axios from 'axios'
import ServiceBase from '../../libs/serviceBase'
import config from '../../configs/app.config'
import { CURRENCY_CODE_FOR_CASINO } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    gameId: { type: 'string' },
    lang: { type: 'string' },
    hasDemo: { type: 'boolean' }
  }
}

const constraints = ajv.compile(schema)
/**

This service is used to accept activate session callback
@export
@class ActivateSessionService
@extends {ServiceBase}
*/
export default class DemoGameLaunchService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const responseObject = {}
    const { gameId, lang } = this.args
    const earCasinoUrl = `${config.get('ear_casino.host')}v1/casino/play/theearcasino`

    const {
      dbModels: {
        CasinoGame: CasinoGameModel,
        GameCategory: GameCategoryModel,
        GameProvider: GameProviderModel
      },
      sequelizeTransaction
    } = this.context

    const casinoGameDetails = await CasinoGameModel.findOne({
      where: { casinoGameId: gameId, status: true },
      include: {
        model: GameCategoryModel,
        as: 'gameCategory',
        required: true
      },
      transaction: sequelizeTransaction
    })

    const providerDetails = await GameProviderModel.findOne({
      where: { providerId: casinoGameDetails.providerId, status: true },
      attributes: ['id', 'providerId', 'status'],
      transaction: sequelizeTransaction
    })

    if (!casinoGameDetails?.hasDemo) {
      return this.addError('DemoNotExistErrorType')
    }
    const gameLaunchData = {
      is_demo: true,
      game_id: casinoGameDetails?.earGameId,
      provider_id: providerDetails?.providerId,
      user_language: lang,
      user_currency: CURRENCY_CODE_FOR_CASINO,
      lobby_url: config.get('ear_casino.lobby_url')
    }

    const authObj = {
      auth: {
        username: `${config.get('ear_casino.client_id')}`,
        password: `${config.get('ear_casino.client_secret')}`
      }
    }
    try {
      const gameLaunchResponse = await axios.post(earCasinoUrl, gameLaunchData, authObj)
      responseObject.data = gameLaunchResponse.data.data
      return { responseObject }
    } catch (e) {
      return this.addError('SomethingWentWrongErrorType', 'Something went wrong')
    }
  }
}

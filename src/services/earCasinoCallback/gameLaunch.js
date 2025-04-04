import ajv from '../../libs/ajv'
import axios from 'axios'
import ServiceBase from '../../libs/serviceBase'
import config from '../../configs/app.config'
import { EAR_ERROR_CODES } from '../../libs/earErrorCodes'
import getBasicAuth from '../../helpers/ear.helper'
import APIError from '../../errors/api.error'
import { StatusCodes } from 'http-status-codes'
import { CURRENCY_CODE_FOR_CASINO } from '../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    gameId: { type: 'string' },
    lang: { type: 'string' },
    isMobile: { type: 'boolean' }
  }
}

const constraints = ajv.compile(schema)
/**

This service is used to accept game launch in real mode
@export
@class GameLaunchService
@extends {ServiceBase}
*/
export default class GameLaunchService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const responseObject = {}
    const { gameId, lang, isMobile } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        CasinoGame: CasinoGameModel,
        Currency: CurrencyModel,
        GameCategory: GameCategoryModel,
        GameProvider: GameProviderModel
      },
      auth: { id: userId },
      sequelizeTransaction
    } = this.context

    const user = await UserModel.findOne({
      where: {
        id: userId
      },
      include:
        [{
          model: WalletModel,
          required: false,
          as: 'wallets',
          include: [
            {
              model: CurrencyModel,
              required: false,
              as: 'currency'
            }
          ]
        }],
      transaction: sequelizeTransaction
    })

    if (!user || !user.active) {
      responseObject.statusCode = EAR_ERROR_CODES.USER_NOT_FOUND
      responseObject.errors = {
        code: EAR_ERROR_CODES.USER_NOT_FOUND,
        error: 'user not found'
      }
      return responseObject
    }

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
      attributes: ['id', 'providerId', 'status', 'slug', 'name'],
      transaction: sequelizeTransaction
    })

    // const currencyCodes = {
    //   evoplay: 'ARX',
    //   booongo: 'AR1',
    //   pragmatic: 'ARS',
    //   pragmaticlive: 'ARS',
    //   triplecherry: 'USDB',
    //   mrslotty: 'AR1',
    //   netgame: 'AR1',
    //   tvbet: 'ARS',
    //   spinthon: 'AR1',
    //   ctinteractive: 'ARS',
    //   gamzix: 'ARS_PA',
    //   fugaso: 'ARS'
    // }

    const gameLaunchData = {
      user_id: parseInt(userId),
      ip_address: '122.175.178.129',
      game_id: casinoGameDetails?.earGameId,
      provider_id: parseInt(providerDetails?.providerId),
      user_language: `${lang}` || 'en',
      user_currency: CURRENCY_CODE_FOR_CASINO,
      lobby_url: config.get('ear_casino.lobby_url'),
      is_mobile: isMobile ? 1 : 0
    }

    const data = JSON.stringify(gameLaunchData)

    const basicUsername = config.get('ear_casino.client_id')
    const basicPassword = config.get('ear_casino.client_secret')
    const basicAuth = await getBasicAuth(basicUsername, basicPassword)

    try {
      const earCasinoUrl = `${config.get('ear_casino.host')}v1/casino/play/${providerDetails.slug}`
      const gameLaunchResponse = await axios.post(earCasinoUrl, data, {
        headers:
        {
          Authorization: basicAuth,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      responseObject.data = gameLaunchResponse.data
      return { responseObject }
    } catch (e) {
      throw new APIError({ name: 'EarCasinoError', description: e.response.data.message, isOperational: true, statusCode: StatusCodes.BAD_REQUEST })
    }
  }
}

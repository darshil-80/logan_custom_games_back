import ajv from '../../../libs/ajv'
import { minus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { canDoubleBet } from '../../../utils/game.utils'
import BlackJackGameHitService from './blackJackGameHit.service'
import BlackJackGameStandService from './blackJackGameStand.service'
import { DEFAULT_GAME_ID, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    betId: { type: 'number' }
  },
  required: ['betId']
}

const constraints = ajv.compile(schema)

/**
 * @export
 * @class BlackJackGameDoubleBetService
 * @extends {ServiceBase}
 */
export default class BlackJackGameDoubleBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betId } = this.args

    const {
      dbModels: {
        Wallet: WalletModel,
        Currency: CurrencyModel,
        Transaction: TransactionModel,
        BlackJackGameBet: BlackJackGameBetModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    const blackJackGameBet = await BlackJackGameBetModel.findOne({
      where: { userId, result: null, gameResult: null, parentBetId: null, id: betId },
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: BlackJackGameBetModel },
      transaction: sequelizeTransaction
    })

    if (!blackJackGameBet) {
      this.addError('NoPlacedBetFoundErrorType')
      return
    }

    if (!canDoubleBet(blackJackGameBet.playerHand) || blackJackGameBet.isSplit) {
      this.addError('BlackJackGameDoubleBetErrorType')
      return
    }

    try {
      const debitTransaction = await TransactionModel.findOne({
        where: {
          betId: blackJackGameBet.id,
          gameId: DEFAULT_GAME_ID.BLACKJACK,
          actioneeId: userId,
          transactionType: TRANSACTION_TYPES.BET
        },
        transaction: sequelizeTransaction
      })

      const userWallet = await WalletModel.findOne({
        where: { ownerType: USER_TYPES.USER, ownerId: userId, currencyId: blackJackGameBet.currencyId },
        include: [{
          attributes: ['code'],
          model: CurrencyModel,
          as: 'currency'
        }],
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
        transaction: sequelizeTransaction
      })

      // if (debitTransaction.paymentMethod === PAYMENT_METHODS.BONUS) {
      //   userWallet.nonCashAmount = minus(userWallet.nonCashAmount, blackJackGameBet.betAmount)
      // } else {
      userWallet.amount = minus(userWallet.amount, blackJackGameBet.betAmount)
      // }

      await userWallet.save({ transaction: sequelizeTransaction })

      await blackJackGameBet.update({
        betAmount: times(2, blackJackGameBet.betAmount),
        isDouble: true
      }, { transaction: sequelizeTransaction })

      await debitTransaction.set({
        amount: times(2, blackJackGameBet.betAmount)
      }).save({ transaction: sequelizeTransaction })

      let response = {}

      const hitResult = (await BlackJackGameHitService.execute({ betId }, this.context)).result

      if (hitResult.gameResult !== null && hitResult.result !== null) {
        response = hitResult
      } else {
        const standResult = (await BlackJackGameStandService.execute({ betId }, this.context)).result
        response = standResult
      }

      return response
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

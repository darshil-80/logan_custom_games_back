import { Op } from 'sequelize'
import ajv from '../../../libs/ajv'
import { plus, times } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'
import { BLACKJACK, BLACKJACK_ODDS, BLACKJACK_RESULT, DEFAULT_GAME_ID, BET_RESULT, TRANSACTION_TYPES, USER_TYPES } from '../../../libs/constants'

const schema = {
  type: 'object',
  properties: {
    dealerHand: { type: 'array' },
    dealersAcePoint: { type: 'number' },
    dealersPoint: { type: 'number' },
    allBets: { type: 'array' }
  },
  required: ['dealerHand', 'allBets', 'dealersAcePoint', 'dealersPoint']
}

const constraints = ajv.compile(schema)

/**
 * @export
 * @class BlackJackGameResolveSplitBetsService
 * @extends {ServiceBase}
 */
export default class BlackJackGameResolveSplitBetsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { dealerHand, allBets, dealersPoint, dealersAcePoint } = this.args

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

    try {
      for (const blackJackGameBet of allBets) {
        let gameResult = null
        let result = null
        let winningAmount = null

        if (dealersPoint > BLACKJACK && dealersAcePoint > BLACKJACK) {
          gameResult = BLACKJACK_RESULT.DEALER_BUST
          result = BET_RESULT.WON
          winningAmount = times(blackJackGameBet.betAmount, BLACKJACK_ODDS.WIN)
        } else if (Math.max(dealersPoint, dealersAcePoint) === BLACKJACK) {
          gameResult = BLACKJACK_RESULT.DEALERS_BLACKJACK
          result = BET_RESULT.LOST
          winningAmount = 0
        } else if (Math.max(dealersPoint, dealersAcePoint) > Math.max(blackJackGameBet.playersPoint, blackJackGameBet.playersAcePoint)) {
          gameResult = BLACKJACK_RESULT.DEALER_WIN
          result = BET_RESULT.LOST
          winningAmount = 0
        } else if (Math.max(blackJackGameBet.playersPoint, blackJackGameBet.playersAcePoint) > Math.max(dealersPoint, dealersAcePoint)) {
          gameResult = BLACKJACK_RESULT.PLAYER_WIN
          result = BET_RESULT.WON
          winningAmount = times(blackJackGameBet.betAmount, BLACKJACK_ODDS.WIN)
        } else {
          gameResult = BLACKJACK_RESULT.PUSH
          result = BET_RESULT.CANCELLED
          winningAmount = 0
        }

        // Saving Game State
        await blackJackGameBet.update({
          dealerHand: [...dealerHand],
          winningAmount,
          dealersAcePoint,
          dealersPoint,
          gameResult,
          result
        }, { transaction: sequelizeTransaction })

        if (winningAmount !== null) {
          const debitTransaction = await TransactionModel.findOne({
            where: {
              betId: blackJackGameBet.id,
              gameId: DEFAULT_GAME_ID.BLACKJACK,
              actioneeId: userId,
              transactionType: TRANSACTION_TYPES.BET
            },
            raw: true,
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
          //   userWallet.nonCashAmount = plus(userWallet.nonCashAmount, blackJackGameBet.winningAmount)
          // } else {
          userWallet.amount = plus(userWallet.amount, blackJackGameBet.winningAmount)
          // }

          await userWallet.save({ transaction: sequelizeTransaction })

          await CreateCreditTransactionService.execute({
            gameId: DEFAULT_GAME_ID.BLACKJACK,
            userWallet,
            betData: blackJackGameBet,
            debitTransaction
          }, this.context)

          WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
        }
      }

      const mainBet = await BlackJackGameBetModel.findOne({
        where: { userId, roundId: allBets[0].roundId, parentBetId: null },
        raw: true,
        transaction: sequelizeTransaction
      })

      const splitBets = await BlackJackGameBetModel.findAll({
        where: { userId, roundId: allBets[0].roundId, parentBetId: { [Op.not]: null } },
        transaction: sequelizeTransaction
      })

      return { ...mainBet, splitBets }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

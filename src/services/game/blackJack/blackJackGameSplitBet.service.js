import { Op } from 'sequelize'
import ajv from '../../../libs/ajv'
import { minus } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { DEFAULT_GAME_ID } from '../../../libs/constants'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import { canSplitBet, getCardPoints, getTotalCards } from '../../../utils/game.utils'
import BlackJackGameGenerateResultService from './blackJackGameGenerateResult.service'

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
 * @class BlackJackGameSplitBetService
 * @extends {ServiceBase}
 */
export default class BlackJackGameSplitBetService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betId } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        BlackJackGameBet: BlackJackGameBetModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    const blackJackGameBet = await BlackJackGameBetModel.findOne({
      where: { userId, id: betId },
      lock: { level: sequelizeTransaction.LOCK.UPDATE, of: BlackJackGameBetModel },
      transaction: sequelizeTransaction
    })

    // to check bet exists
    if (!blackJackGameBet) {
      this.addError('NoPlacedBetFoundErrorType')
      return
    }

    // Fetching user details
    const user = await UserModel.findOne({
      attributes: ['userName'],
      where: {
        id: userId
      },
      include: [{
        model: WalletModel,
        as: 'wallets',
        where: { currencyId: blackJackGameBet.currencyId },
        include: [{
          attributes: ['code'],
          model: CurrencyModel,
          as: 'currency'
        }],
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }
      }],
      transaction: sequelizeTransaction
    })

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    const userWallet = user.wallets?.length ? user.wallets[0] : null

    if (userWallet.amount < +blackJackGameBet.betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${+blackJackGameBet.betAmount}`)
      return
    }

    const blackJackGameSplitBets = await blackJackGameBet.getSplitBets({ transaction: sequelizeTransaction })

    // to check bet can be split or split already
    if (!canSplitBet(blackJackGameBet.playerHand) || blackJackGameSplitBets.length !== 0) {
      this.addError('BlackJackGameSplitBetErrorType')
      return
    }

    const playerHand = [blackJackGameBet.playerHand[0]]

    const splitHand = [blackJackGameBet.playerHand[1]]

    const allBetsInCurrentRound = await BlackJackGameBetModel.findAll({
      where: { userId, roundId: blackJackGameBet.roundId },
      transaction: sequelizeTransaction
    })

    splitHand.push(
      (await BlackJackGameGenerateResultService.execute({
        clientSeed: blackJackGameBet.clientSeed,
        serverSeed: blackJackGameBet.serverSeed,
        totalCards: getTotalCards(allBetsInCurrentRound)
      }, this.context)).result
    )

    try {
      const { acePoints: playersAcePoint, cardPoints: playersPoint } = getCardPoints(playerHand)

      blackJackGameBet.playerHand = playerHand
      blackJackGameBet.playersAcePoint = playersAcePoint
      blackJackGameBet.playersPoint = playersPoint
      blackJackGameBet.isSplit = true

      await blackJackGameBet.save({ transaction: sequelizeTransaction })

      const splitBet = await BlackJackGameBetModel.create({
        userId: userId,
        betAmount: blackJackGameBet.betAmount,
        currencyId: blackJackGameBet.currencyId,
        parentBetId: blackJackGameBet.id,
        playerHand: splitHand,
        playersPoint,
        isSplit: true,
        roundId: blackJackGameBet.roundId,
        dealerHand: blackJackGameBet.dealerHand,
        dealersPoint: blackJackGameBet.dealersPoint,
        dealersAcePoint: blackJackGameBet.dealersAcePoint,
        playersAcePoint,
        currentGameSettings: blackJackGameBet.currentGameSettings,
        clientSeed: blackJackGameBet.clientSeed,
        serverSeed: blackJackGameBet.serverSeed
      }, {
        include: {
          model: UserModel,
          as: 'user'
        },
        transaction: sequelizeTransaction
      })

      // let isPaymentMethodBonus = false
      const betAmount = +blackJackGameBet.betAmount

      // Updating user wallet
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      // // deduct from nonCashAmount first
      // if (userWallet.nonCashAmount >= betAmount) {
      //   isPaymentMethodBonus = true
      //   userWallet.nonCashAmount = minus(userWallet.nonCashAmount, betAmount)
      // } else {
      userWallet.amount = minus(userWallet.amount, betAmount)
      // }

      await userWallet.save({ transaction: sequelizeTransaction })

      await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.BLACKJACK,
        userWallet,
        betData: splitBet
        // isPaymentMethodBonus
      }, this.context)

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      const mainBet = await BlackJackGameBetModel.findOne({
        where: { userId, roundId: blackJackGameBet.roundId, parentBetId: null },
        attributes: [
          'id', 'playerHand', 'dealerHand', 'playersPoint', 'playersAcePoint', 'isDouble',
          'isSplit', 'result', 'gameResult', 'parentBetId', 'roundId'],
        raw: true,
        transaction: sequelizeTransaction
      })

      const splitBets = await BlackJackGameBetModel.findAll({
        where: { userId, roundId: blackJackGameBet.roundId, parentBetId: { [Op.not]: null } },
        attributes: [
          'id', 'playerHand', 'playersPoint', 'playersAcePoint', 'isDouble',
          'isSplit', 'result', 'gameResult', 'parentBetId', 'roundId'],
        transaction: sequelizeTransaction
      })

      return {
        ...mainBet,
        dealerHand: [mainBet.dealerHand[0]],
        splitBets
      }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

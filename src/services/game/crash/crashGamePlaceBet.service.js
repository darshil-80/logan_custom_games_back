import { minus } from 'number-precision'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import { CRASH_GAME_STATE, DEFAULT_GAME_ID } from '../../../libs/constants'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import GameSettingsService from '../common/gameSettings.service'
import UpdateRankingLevelService from '../../bonus/updateRankingLevel.service'
import HandleBonusWageringService from '../../bonus/handleBonusWagering.service'
/**
 *
 *
 * @export
 * @class CrashGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class CrashGamePlaceBetService extends ServiceBase {
  async run () {
    const { autoRate, betAmount, currencyId } = this.args

    const {
      dbModels: {
        User: UserModel,
        Wallet: WalletModel,
        Currency: CurrencyModel,
        CrashGameBet: CrashGameBetModel,
        CrashGameRoundDetail: CrashGameRoundDetailModel
      },
      sequelizeTransaction,
      auth: {
        id: userId
      }
    } = this.context

    // Fetching user details
    const user = await UserModel.findOne({
      attributes: ['userName'],
      where: {
        id: userId
      },
      include: [{
        model: WalletModel,
        as: 'wallets',
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
        where: { currencyId },
        include: [{
          attributes: ['code'],
          model: CurrencyModel,
          as: 'currency'
        }]
      }],
      transaction: sequelizeTransaction
    })

    // Validations
    if (!user) {
      this.addError('NoWalletFoundErrorType', `no wallet found ${userId}`)
      return
    }

    // const userWallet = user.wallets?.length ? user.wallets[0] : null
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null

    if (userWallet.amount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.CRASH.toString() }, this.context)).result

    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (autoRate < gameSettings.minAutoRate && autoRate >= gameSettings.maxOdd) {
      this.addError('AutoRateIsInvalidErrorType', `autoRate ${autoRate}`)
      return
    }

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
      return
    }

    const currentRound = await CrashGameRoundDetailModel.findOne({
      where: {
        roundState: CRASH_GAME_STATE.STARTED
      },
      include: [{
        model: CrashGameBetModel,
        as: 'bets',
        where: {
          userId: userId,
          result: null
        },
        required: false
      }],
      order: [['id', 'DESC']],
      transaction: sequelizeTransaction
    })

    if (!currentRound) {
      this.addError('NoRoundRunningErrorType', 'no round is running')
      return
    }

    const alreadyPlacedBets = currentRound.bets

    if (alreadyPlacedBets && alreadyPlacedBets.length) {
      return alreadyPlacedBets[0]
    }

    // create debit transaction

    try {
      const crashGameBet = await CrashGameBetModel.create({
        roundId: currentRound.roundId,
        userId: userId,
        autoRate,
        betAmount,
        currencyId
      }, {
        include: {
          model: UserModel,
          as: 'user'
        },
        transaction: sequelizeTransaction
      })

      let isPaymentMethodBonus = false
      // Updating user wallet
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })
      // deduct from nonCashAmount first
      if (userWallet.nonCashAmount >= betAmount) {
        isPaymentMethodBonus = true
        userWallet.nonCashAmount = minus(userWallet.nonCashAmount, betAmount)
      } else {
        userWallet.amount = minus(userWallet.amount, betAmount)
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      await HandleBonusWageringService.execute({ userId, userWalletId: userWallet.id, betAmount: +betAmount }, this.context)

      await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.CRASH,
        userWallet,
        betData: crashGameBet,
        isPaymentMethodBonus
      }, this.context)

      await UpdateRankingLevelService.execute({ userId }, this.context)

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      return crashGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

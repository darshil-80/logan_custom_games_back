import Flatted from 'flatted'
import APIError from '../../../errors/api.error'
import ServiceBase from '../../../libs/serviceBase'
import { times, minus, plus } from 'number-precision'
import { calculateOdds } from '../../../utils/math.utils'
import GameSettingsService from '../common/gameSettings.service'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import HiLoGameCalculateOddsForBet from './hiloGameCalculateOddsForBet.service'
import {
  DEFAULT_GAME_ID, BET_RESULT, TRANSACTION_TYPES
  // PAYMENT_METHODS
} from '../../../libs/constants'
import CreateCreditTransactionService from '../common/createCreditTransaction.service'

/**
 *
 *
 * @export
 * @class HiLoGameCashOutBetService
 * @extends {ServiceBase}
 */
export default class HiLoGameCashOutBetService extends ServiceBase {
  async run () {
    const { currencyId } = this.args
    const {
      dbModels: {
        User: UserModel,
        HiLoGameBet: HiLoGameBetModel,
        HiLoGameBetState: HiLoGameBetStateModel,
        Transaction: TransactionModel,
        Currency: CurrencyModel,
        Wallet: WalletModel
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
        lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel },
        as: 'wallets',
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

    // const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary)[0] : null
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null

    const hiLoGameBet = await HiLoGameBetModel.findOne({
      where: {
        userId,
        result: null
      },
      include: [{
        model: HiLoGameBetStateModel,
        as: 'betStates'
      }, {
        model: TransactionModel,
        where: {
          transactionType: TRANSACTION_TYPES.BET
        },
        required: false
      }, {
        model: CurrencyModel,
        as: 'currency'
      }],
      order: [
        [{ model: HiLoGameBetStateModel, as: 'betStates' }, 'id', 'ASC']
      ],
      lock: {
        level: sequelizeTransaction.LOCK.UPDATE,
        of: HiLoGameBetModel
      },
      transaction: sequelizeTransaction
    })
    if (!hiLoGameBet) {
      this.addError('NoPlacedBetFoundErrorType', `no user found ${userId}`)
      return
    }

    if (this.args.result === BET_RESULT.LOST) {
      hiLoGameBet.winningAmount = 0
      hiLoGameBet.result = BET_RESULT.LOST
    } else {
      hiLoGameBet.result = BET_RESULT.WON
      const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.HILO.toString() }, this.context)).result
      const maxProfit = gameSettings.maxProfit.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

      let odds = await HiLoGameCalculateOddsForBet.run({ bet: Flatted.parse(Flatted.stringify(hiLoGameBet)) }, this.context)

      odds = calculateOdds(gameSettings, odds)

      let winningAmount = times(hiLoGameBet.betAmount, odds)

      const profit = minus(winningAmount, hiLoGameBet.betAmount)

      if (profit > maxProfit) {
        winningAmount = plus(hiLoGameBet.betAmount, maxProfit.amount)
      }

      hiLoGameBet.winningAmount = winningAmount
    }

    try {
      const debitTransaction = hiLoGameBet.Transactions[0]

      // Updating user wallet
      await userWallet.reload({ lock: { level: sequelizeTransaction.LOCK.UPDATE, of: WalletModel }, transaction: sequelizeTransaction })

      // if (debitTransaction.paymentMethod === PAYMENT_METHODS.BONUS) {
      //   userWallet.nonCashAmount = plus(userWallet.nonCashAmount, hiLoGameBet.winningAmount)
      // } else {
      //   userWallet.amount = plus(userWallet.amount, hiLoGameBet.winningAmount)
      // }
      userWallet.amount = plus(userWallet.amount, hiLoGameBet.winningAmount)
      await CreateCreditTransactionService.execute({
        gameId: DEFAULT_GAME_ID.HILO,
        userWallet,
        betData: hiLoGameBet,
        debitTransaction
      }, this.context)

      await hiLoGameBet?.save({ transaction: sequelizeTransaction })
      await userWallet.save({ transaction: sequelizeTransaction })

      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      const nextServerSeedHash = await generateServerSeedHash(userId)

      hiLoGameBet.nextServerSeedHash = nextServerSeedHash

      return hiLoGameBet
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

import APIError from '../../../errors/api.error'
import { minus } from 'number-precision'
import ServiceBase from '../../../libs/serviceBase'
import GameSettingsService from '../common/gameSettings.service'
import { getCachedData } from '../../../helpers/redis.helpers'
import { DEFAULT_GAME_ID } from '../../../libs/constants'
import WalletEmitter from '../../../socket-resources/emitters/wallet.emitter'
import CreateDebitTransactionService from '../common/createDebitTransaction.service'
import { getServerSeedCacheKey } from '../../../utils/user.utils'
import { generateServerSeedHash } from '../../../helpers/encryption.helpers'
import UpdateRankingLevelService from '../../bonus/updateRankingLevel.service'
import HandleBonusWageringService from '../../bonus/handleBonusWagering.service'

/**
 *
 *
 * @export
 * @class HiLoGamePlaceBetService
 * @extends {ServiceBase}
 */
export default class HiLoGamePlaceBetService extends ServiceBase {
  async run () {
    const { initialCard, betAmount, clientSeed, currencyId } = this.args

    const {
      dbModels: {
        User: UserModel,
        HiLoGameBet: HiLoGameBetModel,
        Wallet: WalletModel,
        Currency: CurrencyModel
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

    // const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary)[0] : null
    const userWallet = user.wallets?.length ? user.wallets.filter(item => item.primary === true)[0] : null

    if (userWallet.amount < +betAmount && userWallet.nonCashAmount < +betAmount) {
      this.addError('NotEnoughBalanceErrorType', `not enough balance walletAmount ${userWallet.amount} betAmount ${betAmount}`)
      return
    }

    // INFO: Prevent bet if a bet is already open
    const previousOpenBet = await HiLoGameBetModel.findOne({
      where: {
        userId,
        result: null
      }
    })

    if (previousOpenBet) return this.addError('PreviousOpenBetExistErrorType')

    const gameSettings = (await GameSettingsService.execute({ gameId: DEFAULT_GAME_ID.HILO.toString() }, this.context)).result
    const minBetAmount = gameSettings.minBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]
    const maxBetAmount = gameSettings.maxBet.filter(gameSetting => gameSetting.coinName === userWallet.currency.code)[0]

    if (betAmount < +minBetAmount.amount || betAmount > +maxBetAmount.amount) {
      return this.addError('BetAmountIsNotInLimitErrorType', `beAmount ${betAmount}`)
    }

    const serverSeed = await getCachedData(getServerSeedCacheKey(userId))

    if (!serverSeed) this.addError('ServerSeedNotFoundErrorType')

    const { minOdd, maxOdd, houseEdge } = gameSettings

    // create debit transaction
    try {
      const hiLoGameBet = await HiLoGameBetModel.create({
        userId: userId,
        initialCard,
        betAmount,
        currencyId,
        clientSeed: clientSeed,
        serverSeed,
        currentGameSettings: JSON.stringify({ minOdd, maxOdd, houseEdge })
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
        WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      } else {
        userWallet.amount = minus(userWallet.amount, betAmount)
        WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)
      }

      await userWallet.save({ transaction: sequelizeTransaction })

      await CreateDebitTransactionService.execute({
        gameId: DEFAULT_GAME_ID.HILO,
        userWallet,
        betData: hiLoGameBet,
        isPaymentMethodBonus
      }, this.context)

      await HandleBonusWageringService.execute({ userId, userWalletId: userWallet.id, betAmount: +betAmount }, this.context)

      await UpdateRankingLevelService.execute({ userId }, this.context)
      console.log("wallet---------->>", userWallet?.toJSON(), userWallet.ownerId)
      WalletEmitter.emitUserWalletBalance(userWallet?.toJSON(), userWallet.ownerId)

      const { serverSeedHash: nextServerSeedHash } = await generateServerSeedHash(userId)

      hiLoGameBet.nextServerSeedHash = nextServerSeedHash

      return { ...hiLoGameBet.dataValues, nextServerSeedHash }
    } catch (error) {
      throw new APIError({ name: 'Internal', description: error.message })
    }
  }
}

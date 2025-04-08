import moment from "moment";
import ServiceBase from "../../../libs/serviceBase";
import { minus, plus, times } from "number-precision";
import GameSettingsService from "../common/gameSettings.service";
import WalletEmitter from "../../../socket-resources/emitters/wallet.emitter";
import CrashGameGetMultiplierByGraphTimeService from "./crashGameGetMultiplierByGraphTime.service";
import {
    CRASH_GAME_STATE,
    DEFAULT_GAME_ID,
    BET_RESULT,
} from "../../../libs/constants";
import inMemoryDB from "../../../libs/inMemoryDb";

/**
 *
 *
 * @export
 * @class CrashGamePlayerEscapeService
 * @extends {ServiceBase}
 */
export default class CrashGamePlayerEscapeService extends ServiceBase {
    async run() {
        const { userId } = this.args;
        const currentRounds = await inMemoryDB.getAll("crashGameRounddetails");
        const currentRound = currentRounds.find(
            (round) => round.roundState === CRASH_GAME_STATE.ON_HOLD
        );

        if (!currentRound) {
            this.addError("NoRoundRunningErrorType", "round is not running");
            return;
        }

        const crashGameBet = await inMemoryDB.get("crashGameBets", userId);

        if (
            !crashGameBet ||
            (crashGameBet.result !== null &&
                crashGameBet.winningAmount !== "0" &&
                crashGameBet.escapeRate !== 0 &&
                crashGameBet.roundId !== currentRound.roundId)
        ) {
            this.addError("NoPlacedBetFoundErrorType", "no bet found");
            return;
        }

        const gameSettings = {
          id: 1,
          gameId: '1',
          minBet: [ { coinName: 'USD', amount: 1 } ],
          maxBet: [ { coinName: 'USD', amount: 20 } ],
          maxProfit: [ { coinName: 'USD', amount: 50 } ],
          houseEdge: 4,
          minOdds: 1,
          maxOdds: 20,
          minAutoRate: 1.01,
          maxNumberOfAutoBets: 50,
          createdAt: '2025-01-21T09:02:19.680Z',
          updatedAt: '2025-01-30T11:22:53.615Z',
          gameDetails: {
            id: '1',
            name: 'crash',
            status: true,
            createdAt: '2025-01-21T09:02:19.638Z',
            updatedAt: '2025-01-21T09:02:19.638Z'
          },
          minOdd: 1,
          maxOdd: 20
        }
        
        const startTime = moment(currentRound.onHoldAt);
        const escapeTime = moment();
        const timeDiff = escapeTime.diff(startTime);

        const multiplier = await CrashGameGetMultiplierByGraphTimeService.run(
            { time: timeDiff / 1000 },
            {}
        );

        if (+multiplier > +currentRound.crashRate) {
            this.addError("NoRoundRunningErrorType", "round is not running");
            return;
        }

        crashGameBet.escapeRate = multiplier;
        crashGameBet.result = BET_RESULT.WON;
        crashGameBet.winningAmount = times(multiplier, crashGameBet.betAmount);

        const user = await inMemoryDB.get("users", userId);
        const userWallet = user.wallet;
        const maxBetProfit = gameSettings.maxProfit.filter(
            (gameSetting) => gameSetting.coinName === userWallet.currency.code
        )[0];

        const profit = minus(
            crashGameBet.winningAmount,
            crashGameBet.betAmount
        );

        if (profit > maxBetProfit.amount) {
            crashGameBet.winningAmount = plus(
                crashGameBet.betAmount,
                maxBetProfit.amount
            );
        }

        userWallet.amount = plus(userWallet.amount, crashGameBet.winningAmount);
        await inMemoryDB.set("users", userId, user);

        WalletEmitter.emitUserWalletBalance(
            {
                amount: userWallet.amount,
                primary: true,
                currencyId: "2",
                ownerType: "USER",
                ownerId: userWallet.ownerId,
                nonCashAmount: 0,
                bonusBalance: 10,
                walletAddress: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                currency: {
                    id: "2",
                    code: "USD",
                },
            },
            userWallet.ownerId
        );

        await inMemoryDB.set("crashGameBets", userId, crashGameBet);
        const updatedCrashGameBet = await inMemoryDB.get(
            "crashGameBets",
            userId
        );
        return updatedCrashGameBet;
    }
}

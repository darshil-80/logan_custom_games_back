import { plus } from "number-precision";
import ServiceBase from "../../../libs/serviceBase";
import WalletEmitter from "../../../socket-resources/emitters/wallet.emitter";
import {
    CRASH_GAME_STATE,
    BET_RESULT,
} from "../../../libs/constants";
import inMemoryDB from "../../../libs/inMemoryDb";

/**
 *
 *
 * @export
 * @class CrashGameCancelBetService
 * @extends {ServiceBase}
 */
export default class CrashGameCancelBetService extends ServiceBase {
    async run() {

        const { userId } = this.args;
        const currentRounds = await inMemoryDB.getAll("crashGameRounddetails");
        const currentRound = currentRounds.find(
            (round) => round.roundState === CRASH_GAME_STATE.STARTED
        );

        if (!currentRound) {
            this.addError("NoRoundRunningErrorType", "no round is running");
            return;
        }

        const alreadyPlacedBet = await inMemoryDB.get("crashGameBets", userId);

        if (
            !alreadyPlacedBet ||
            (alreadyPlacedBet.result !== null && alreadyPlacedBet.roundId !== currentRound.roundId)
        ) {
            this.addError("NoPlacedBetFoundErrorType", "no bet found");
            return;
        }
        
        const betAmount = alreadyPlacedBet.betAmount;
        
        const user = await inMemoryDB.get("users", userId);
        const userWallet = user.wallet;
       

       
        userWallet.amount = plus(userWallet.amount, betAmount);
        await inMemoryDB.set("users", userId, user);

        // await userWallet.save({ transaction: sequelizeTransaction });

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

        alreadyPlacedBet.result = BET_RESULT.CANCELLED;
        await inMemoryDB.set("crashGameBets", userId, alreadyPlacedBet);

        const updatedCrashGameBet = await inMemoryDB.get(
          "crashGameBets",
          userId
      );
        return updatedCrashGameBet.roundId;
    }
}

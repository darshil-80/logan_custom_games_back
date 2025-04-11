import express from "express";
import CrashGameController from "../../../controllers/crashGame.controller";
import responseValidationMiddleware from "../../../middlewares/responseValidation.middleware";

const crashGameRoutes = express.Router();

crashGameRoutes.get("/restart", CrashGameController.restartCrashGame);

// get-crash-game-history route
crashGameRoutes.route("/get-crash-game-history").get(
    CrashGameController.getCrashGameHistory,
    responseValidationMiddleware()
);

// place-bet-crash-game route
crashGameRoutes.route("/place-bet-crash-game").post(
    CrashGameController.placeBetCrashGame,
    responseValidationMiddleware()
);

// cancel-bet-crash-game route
crashGameRoutes.route("/cancel-bet-crash-game").post(
    CrashGameController.cancelBetCrashGame,
    responseValidationMiddleware()
);

// player-escape-crashGame route
crashGameRoutes.route("/player-escape-crashGame").post(
    CrashGameController.playerEscapeCrashGame,
    responseValidationMiddleware()
);

export default crashGameRoutes;

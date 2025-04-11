import express from "express";
import responseValidationMiddleware from "../../../middlewares/responseValidation.middleware";
import PlinkoGameController from "../../../controllers/plinkoGame.controller";

const plinkoGameRoutes = express.Router();

// place-bet route
plinkoGameRoutes
    .route("/place-bet")
    .post(PlinkoGameController.placeBet, responseValidationMiddleware());

// post-lightning-mode route
plinkoGameRoutes
    .route("/lightning-board-details")
    .post(
        PlinkoGameController.postLightningBoardDetails,
        responseValidationMiddleware()
    );

export default plinkoGameRoutes;

import express from "express";
import { StatController } from "../controllers/stat.controller";
import { StatService } from "../services/stat.service";
import { StatUseCase } from "../business/stat/stat.usecase";

const router = express.Router();
const statService = new StatService();
const statUseCase = new StatUseCase(statService);
const statController = new StatController(statUseCase);

router
    .route('/table/:tournamentId')
    .get(statController.getTournamentTable.bind(statController));

export default router;
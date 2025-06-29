import express from 'express';
import { GameResultController } from '../controllers/gameResult.controller';
import { GameResultService } from '../services/gameResult.service';
import { GameResultUseCase } from '../business/gameResult/gameResult.usecase';
import { authMiddleware, checkAdminRole } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';

const router = express.Router();
const gameResultService = new GameResultService();
const gameResultUseCase = new GameResultUseCase(gameResultService);
const gameResultController = new GameResultController(gameResultUseCase);

router
    .route('/')
    .get(checkAdminRole, gameResultController.getGameResults.bind(gameResultController))
    .post(checkAdminRole, gameResultController.createGameResult.bind(gameResultController))
    .put(checkAdminRole, gameResultController.updateGameResult.bind(gameResultController));

router
    .route('/:id')
    .delete(checkAdminRole, gameResultController.deleteGameResult.bind(gameResultController));

export default router;
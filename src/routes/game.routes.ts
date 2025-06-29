import express from 'express';
import { GameController } from '../controllers/game.controller';
import { GameService } from '../services/game.service';
import { GameUseCase } from '../business/game/game.usecase';
import { authMiddleware, checkAdminRole } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';

const router = express.Router();
const gameService = new GameService();
const gameUseCase = new GameUseCase(gameService);
const gameController = new GameController(gameUseCase);

router
    .route('/')
    .get(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN, UserRole.USER]), gameController.getGames.bind(gameController))
    .post(checkAdminRole, gameController.createGame.bind(gameController))
    .put(checkAdminRole, gameController.updateGame.bind(gameController));

router
    .route('/:id')
    .delete(checkAdminRole, gameController.deleteGame.bind(gameController));

export default router;
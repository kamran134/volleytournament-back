import express from 'express';
import { GameController } from '../controllers/game.controller';
import { GameService } from '../services/game.service';
import { GameUseCase } from '../business/game/game.usecase';
import { checkAdminRoleWithRefreshToken } from '../middleware/auth.middleware';

const router = express.Router();
const gameService = new GameService();
const gameUseCase = new GameUseCase(gameService);
const gameController = new GameController(gameUseCase);

router
    .route('/')
    .get(gameController.getGames.bind(gameController))
    .post(checkAdminRoleWithRefreshToken, gameController.createGame.bind(gameController))
    .put(checkAdminRoleWithRefreshToken, gameController.updateGame.bind(gameController));

router
    .route('/upcoming')
    .get(gameController.getUpcomingGames.bind(gameController));

router
    .route('/:id')
    .get(gameController.getGame.bind(gameController))
    .delete(checkAdminRoleWithRefreshToken, gameController.deleteGame.bind(gameController));

export default router;

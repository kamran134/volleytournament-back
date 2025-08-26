import express from 'express';
import { GamerController } from '../controllers/gamer.controller';
import { GamerService } from '../services/gamer.service';
import { GamerUseCase } from '../business/gamer/gamer.usecase';
import { checkAdminCoachCaptainRoleWithRefreshToken, checkAdminRoleWithRefreshToken, checkUserRoleWithRefreshToken } from '../middleware/auth.middleware';

const router = express.Router();
const gamerService = new GamerService();
const gamerUseCase = new GamerUseCase(gamerService);
const gamerController = new GamerController(gamerUseCase);

router
    .route('/')
    .get(checkUserRoleWithRefreshToken, gamerController.getGamers.bind(gamerController))
    .post(checkAdminCoachCaptainRoleWithRefreshToken, gamerController.createGamer.bind(gamerController))
    .put(checkAdminCoachCaptainRoleWithRefreshToken, gamerController.updateGamer.bind(gamerController));

router
    .route('/:id')
    .delete(checkAdminRoleWithRefreshToken, gamerController.deleteGamer.bind(gamerController));

export default router;

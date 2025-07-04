import express from 'express';
import { GamerController } from '../controllers/gamer.controller';
import { GamerService } from '../services/gamer.service';
import { GamerUseCase } from '../business/gamer/gamer.usecase';
import { checkAdminCoachCaptainRole, checkAdminRole, checkUserRole } from '../middleware/auth.middleware';

const router = express.Router();
const gamerService = new GamerService();
const gamerUseCase = new GamerUseCase(gamerService);
const gamerController = new GamerController(gamerUseCase);

router
    .route('/')
    .get(checkUserRole, gamerController.getGamers.bind(gamerController))
    .post(checkAdminCoachCaptainRole, gamerController.createGamer.bind(gamerController))
    .put(checkAdminCoachCaptainRole, gamerController.updateGamer.bind(gamerController));

router
    .route('/:id')
    .delete(checkAdminRole, gamerController.deleteGamer.bind(gamerController));

export default router;
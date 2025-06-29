import express from 'express';
import { GamerController } from '../controllers/gamer.controller';
import { GamerService } from '../services/gamer.service';
import { GamerUseCase } from '../business/gamer/gamer.usecase';
import { authMiddleware, checkAdminRole } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';

const router = express.Router();
const gamerService = new GamerService();
const gamerUseCase = new GamerUseCase(gamerService);
const gamerController = new GamerController(gamerUseCase);

router
    .route('/')
    .get(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN, UserRole.USER]), gamerController.getGamers.bind(gamerController))
    .post(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), gamerController.createGamer.bind(gamerController))
    .put(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), gamerController.updateGamer.bind(gamerController));

router
    .route('/:id')
    .delete(checkAdminRole, gamerController.deleteGamer.bind(gamerController));

export default router;
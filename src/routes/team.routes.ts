import express from 'express';
import { TeamController } from '../controllers/team.controller';
import { TeamService } from '../services/team.service';
import { TeamUseCase } from '../business/team/team.usecase';
import { authMiddleware, checkAdminRole } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';

const router = express.Router();
const teamService = new TeamService();
const teamUseCase = new TeamUseCase(teamService);
const teamController = new TeamController(teamUseCase);

router
    .route('/')
    .get(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), teamController.getTeams.bind(teamController))
    .post(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), teamController.createTeam.bind(teamController))
    .put(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), teamController.updateTeam.bind(teamController));

router
    .route('/:id')
    .delete(checkAdminRole, teamController.deleteTeam.bind(teamController));

export default router;
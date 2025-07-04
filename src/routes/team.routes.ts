import express from 'express';
import { TeamController } from '../controllers/team.controller';
import { TeamService } from '../services/team.service';
import { TeamUseCase } from '../business/team/team.usecase';
import { checkAdminCoachCaptainRole, checkAdminRole } from '../middleware/auth.middleware';

const router = express.Router();
const teamService = new TeamService();
const teamUseCase = new TeamUseCase(teamService);
const teamController = new TeamController(teamUseCase);

router
    .route('/')
    .get(checkAdminCoachCaptainRole, teamController.getTeams.bind(teamController))
    .post(checkAdminCoachCaptainRole, teamController.createTeam.bind(teamController))
    .put(checkAdminCoachCaptainRole, teamController.updateTeam.bind(teamController));

router
    .route('/:id')
    .delete(checkAdminRole, teamController.deleteTeam.bind(teamController));

export default router;
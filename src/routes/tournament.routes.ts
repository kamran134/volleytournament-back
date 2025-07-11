import express from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { TournamentService } from '../services/tournament.service';
import { TournamentUseCase } from '../business/tournament/tournament.usecase';
import { checkAdminRole } from '../middleware/auth.middleware';

const router = express.Router();
const tournamentService = new TournamentService();
const tournamentUseCase = new TournamentUseCase(tournamentService);
const tournamentController = new TournamentController(tournamentUseCase);

router
    .route('/')
    .get(tournamentController.getTournaments.bind(tournamentController))
    .post(checkAdminRole, tournamentController.createTournament.bind(tournamentController))
    .put(checkAdminRole, tournamentController.updateTournament.bind(tournamentController));

router
    .route('/:id')
    .delete(checkAdminRole, tournamentController.deleteTournament.bind(tournamentController));

export default router;
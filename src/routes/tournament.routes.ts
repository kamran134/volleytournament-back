import express from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { TournamentService } from '../services/tournament.service';
import { TournamentUseCase } from '../business/tournament/tournament.usecase';
import { checkAdminRole } from '../middleware/auth.middleware';

import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|webp/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

const router = express.Router();
const tournamentService = new TournamentService();
const tournamentUseCase = new TournamentUseCase(tournamentService);
const tournamentController = new TournamentController(tournamentUseCase);

router
    .route('/')
    .get(tournamentController.getTournaments.bind(tournamentController))
    .post(checkAdminRole, upload.single('logo'), tournamentController.createTournament.bind(tournamentController))
    .put(checkAdminRole, upload.single('logo'), tournamentController.updateTournament.bind(tournamentController));

router
    .route('/by-short-name')
    .get(tournamentController.getTournamentByShortName.bind(tournamentController));

router
    .route('/upload-logo')
    .post(checkAdminRole, tournamentController.uploadTournamentLogo.bind(tournamentController));

router
    .route('/:id')
    .delete(checkAdminRole, tournamentController.deleteTournament.bind(tournamentController));

export default router;
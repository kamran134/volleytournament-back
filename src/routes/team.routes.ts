import express from 'express';
import { TeamController } from '../controllers/team.controller';
import { TeamService } from '../services/team.service';
import { TeamUseCase } from '../business/team/team.usecase';
import { checkAdminCoachCaptainRole, checkAdminRole } from '../middleware/auth.middleware';
import { parseFormDataTournaments } from '../middleware/formData.middleware';
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
const teamService = new TeamService();
const teamUseCase = new TeamUseCase(teamService);
const teamController = new TeamController(teamUseCase);

router
    .route('/')
    .get(checkAdminCoachCaptainRole, teamController.getTeams.bind(teamController))
    .post(checkAdminCoachCaptainRole, upload.single('logo'), parseFormDataTournaments, teamController.createTeam.bind(teamController))
    .put(checkAdminCoachCaptainRole, upload.single('logo'), parseFormDataTournaments, teamController.updateTeam.bind(teamController));

router
    .route('/:id')
    .delete(checkAdminRole, teamController.deleteTeam.bind(teamController));

export default router;
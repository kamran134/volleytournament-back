import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getUserSettings, updateUserSettings } from '../controllers/userSettings.controller';

const router = express.Router();

router.route('/')
    .get(authMiddleware(["superadmin", "admin", "moderator", "user"]), getUserSettings)
    .put(authMiddleware(["superadmin", "admin", "moderator", "user"]), updateUserSettings);

export default router;
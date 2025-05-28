import express from 'express';
import { getUsers, updateUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.route("/")
    .get(authMiddleware(["superadmin", "admin"]), getUsers)
    .put(authMiddleware(["superadmin", "admin"]), updateUser);

// router.route("/:id")
export default router;
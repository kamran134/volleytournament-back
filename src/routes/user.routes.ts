import express from 'express';
import { createUser, deleteUser, getUsers, updateUser } from '../controllers/user.controller';
import { authMiddleware, checkAdminRole } from '../middleware/auth.middleware';

const router = express.Router();

router.route("/")
    .get(checkAdminRole, getUsers)
    .post(checkAdminRole, createUser)
    .put(checkAdminRole, updateUser);
router.route("/:id")
    .delete(authMiddleware(["superadmin", "admin"]), deleteUser);

export default router;
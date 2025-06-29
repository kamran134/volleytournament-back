import express from 'express';
import { authMiddleware, checkAdminRole } from '../middleware/auth.middleware';
import { UserRole } from '../constants/roles';
import { UserService } from '../services/user.service';
import { UserUseCase } from '../business/user/user.usecase';
import { UserController } from '../controllers/user.controller';

const router = express.Router();
const userService = new UserService();
const userUseCase = new UserUseCase(userService);
const userController = new UserController(userUseCase);

router.route("/")
    .get(checkAdminRole, userController.getUsers.bind(userController))
    .post(checkAdminRole, userController.createUser.bind(userController))
    .put(checkAdminRole, userController.updateUser.bind(userController));
router.route("/:id")
    .delete(authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]), userController.deleteUser.bind(userController));

export default router;
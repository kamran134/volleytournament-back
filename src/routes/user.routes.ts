import express from 'express';
import { checkAdminRoleWithRefreshToken } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { UserUseCase } from '../business/user/user.usecase';
import { UserController } from '../controllers/user.controller';

const router = express.Router();
const userService = new UserService();
const userUseCase = new UserUseCase(userService);
const userController = new UserController(userUseCase);

router.route("/")
    .get(checkAdminRoleWithRefreshToken, userController.getUsers.bind(userController))
    .post(checkAdminRoleWithRefreshToken, userController.createUser.bind(userController))
    .put(checkAdminRoleWithRefreshToken, userController.updateUser.bind(userController));
router.route("/:id")
    .delete(checkAdminRoleWithRefreshToken, userController.deleteUser.bind(userController));

export default router;
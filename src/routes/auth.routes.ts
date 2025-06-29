import express from "express";
import { authMiddleware, checkAdminRole } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";
import { AuthUseCase } from "../business/auth/auth.usecase";
import { AuthController } from "../controllers/auth.controller";
import { UserRole } from "../constants/roles";

const router = express.Router();
const authService = new AuthService();
const authUseCase = new AuthUseCase(authService);
const authController = new AuthController(authUseCase);

router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/approve/:id", checkAdminRole, authController.approveUser.bind(authController));
router.get("/check-role/:id", authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]), authController.checkRole.bind(authController));
router.post("/logout", authController.logout.bind(authController));

export default router;
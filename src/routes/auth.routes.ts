import express from "express";
import { authMiddlewareWithRefreshToken, checkAdminRoleWithRefreshToken } from "../middleware/auth.middleware";
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
router.post("/approve/:id", checkAdminRoleWithRefreshToken, authController.approveUser.bind(authController));
router.get("/check-role/:id", authMiddlewareWithRefreshToken([UserRole.ADMIN, UserRole.SUPERADMIN]), authController.checkRole.bind(authController));
router.post("/logout", authController.logout.bind(authController));

// REFRESH TOKEN ROUTES - UNCOMMENT AFTER REFACTORING
router.post("/login-refresh", authController.loginWithRefreshToken.bind(authController));
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post("/logout-refresh", authMiddlewareWithRefreshToken([UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), authController.logoutWithRefreshToken.bind(authController));
router.post("/logout-all", authMiddlewareWithRefreshToken([UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COACH, UserRole.CAPTAIN]), authController.logoutAllDevices.bind(authController));

export default router;
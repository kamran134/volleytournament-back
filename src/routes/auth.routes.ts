import express from "express";
import { login, register, approveUser, logout } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/approve/:id", authMiddleware(["superadmin"]), approveUser);
router.post("/logout", logout);

export default router;
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/roles";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";
import { verifyToken } from "../utils/jwt.utils";

interface DecodedToken {
    userId: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
            // REFRESH TOKEN REQUEST PROPERTY - UNCOMMENT AFTER REFACTORING
            needsTokenRefresh?: boolean;
        }
    }
}

export const authMiddleware = (roles: UserRole[]) => (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies.token;
    if (!token) {
        throw new AppError(MESSAGES.AUTH.REQUIRED, 401);
    }

    try {
        const decoded = verifyToken(token) as DecodedToken;
        if (!roles.includes(decoded.role)) {
            throw new AppError(MESSAGES.AUTH.FORBIDDEN, 403);
        }
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
}

// REFRESH TOKEN MIDDLEWARE - UNCOMMENT AFTER REFACTORING
export const authMiddlewareWithRefreshToken = (roles: UserRole[]) => (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
        throw new AppError(MESSAGES.AUTH.REQUIRED, 401);
    }

    try {
        const decoded = verifyToken(accessToken) as DecodedToken;
        if (!roles.includes(decoded.role)) {
            throw new AppError(MESSAGES.AUTH.FORBIDDEN, 403);
        }
        req.user = decoded;
        next();
    } catch (error) {
        // If access token is invalid, try to refresh it
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // Set a flag to indicate token refresh is needed
            req.needsTokenRefresh = true;
            next();
        } else {
            next(error);
        }
    }
}

// OPTIONAL MIDDLEWARE FOR HANDLING TOKEN REFRESH AUTOMATICALLY - UNCOMMENT AFTER REFACTORING
export const autoRefreshMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (req.needsTokenRefresh && req.cookies.refreshToken) {
        try {
            const { AuthService } = require('../services/auth.service');
            const authService = new AuthService();
            const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(req.cookies.refreshToken);
            
            // Set new cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Decode the new access token to set req.user
            const decoded = verifyToken(accessToken) as DecodedToken;
            req.user = decoded;
        } catch (error) {
            throw new AppError(MESSAGES.AUTH.REQUIRED, 401);
        }
    }
    next();
}

export const checkSuperAdminRole = authMiddleware([UserRole.SUPERADMIN]);
export const checkAdminRole = authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]);
export const checkAdminCoachCaptainRole = authMiddleware([
    UserRole.ADMIN,
    UserRole.COACH,
    UserRole.CAPTAIN,
    UserRole.SUPERADMIN,
]);
export const checkUserRole = authMiddleware([
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
    UserRole.COACH,
    UserRole.CAPTAIN,
]);

// REFRESH TOKEN MIDDLEWARE HELPERS - UNCOMMENT AFTER REFACTORING
export const checkSuperAdminRoleWithRefreshToken = authMiddlewareWithRefreshToken([UserRole.SUPERADMIN]);
export const checkAdminRoleWithRefreshToken = authMiddlewareWithRefreshToken([UserRole.ADMIN, UserRole.SUPERADMIN]);
export const checkAdminCoachCaptainRoleWithRefreshToken = authMiddlewareWithRefreshToken([
    UserRole.ADMIN,
    UserRole.COACH,
    UserRole.CAPTAIN,
    UserRole.SUPERADMIN,
]);
export const checkUserRoleWithRefreshToken = authMiddlewareWithRefreshToken([
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
    UserRole.COACH,
    UserRole.CAPTAIN,
]);
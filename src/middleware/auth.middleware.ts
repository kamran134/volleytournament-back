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

export const checkAdminRole = authMiddleware([UserRole.ADMIN, UserRole.SUPERADMIN]);
export const checkAdminCoachCaptainRole = authMiddleware([
    UserRole.ADMIN,
    UserRole.COACH,
    UserRole.CAPTAIN,
    UserRole.SUPERADMIN,
]);
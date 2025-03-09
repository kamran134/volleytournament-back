import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Расширяем Request
declare global {
    namespace Express {
        interface Request {
            user?: { userId: string; role: string };
        }
    }
}

export const authMiddleware = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: "Avtorizasiya tələb olunur" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; }

        if (!roles.includes(decoded.role)) {
            res.status(403).json({ message: "Qadağan olunub!" });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        console.error(error);
    }
}
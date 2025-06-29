import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { AppError } from "./errors";
import { MESSAGES } from "../constants/messages";

export const signToken = (payload: object, expiresIn: string = '48h'): string => {
    const secret = process.env.JWT_SECRET as Secret;
    if (!secret) {
        throw new AppError(MESSAGES.JWT_SECRET_NOT_FOUND, 500);
    }

    const options: SignOptions = { expiresIn: expiresIn as unknown as number };

    return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
    const secret = process.env.JWT_SECRET as Secret;
    if (!secret) {
        throw new AppError(MESSAGES.JWT_SECRET_NOT_FOUND, 500);
    }

    try {
        const decoded = jwt.verify(token, secret);
        
        if (typeof decoded === 'string') {
            throw new AppError(MESSAGES.AUTH.INVALID_TOKEN, 401);
        }

        return decoded;
    } catch (error) {
        throw new AppError(MESSAGES.AUTH.INVALID_TOKEN, 401);
    }
};
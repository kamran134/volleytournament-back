import { Types } from "mongoose";
import UserModel, { IUser } from "../models/user.model";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";
import { comparePassword, hashPassword } from "../utils/hash.utils";
import { signToken } from "../utils/jwt.utils";
// REFRESH TOKEN IMPORTS - UNCOMMENT AFTER REFACTORING
import { signRefreshToken, generateTokenPair, verifyRefreshToken } from "../utils/jwt.utils";
import { RefreshTokenService } from "./refreshToken.service";

export class AuthService {
    async findUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }

    async findUserById(id: Types.ObjectId): Promise<IUser | null> {
        return UserModel.findById(id);
    }

    async createUser(userData: Partial<IUser>): Promise<IUser> {
        try {
            const user = new UserModel(userData);
            return await user.save();
        } catch (error) {
            throw new AppError(MESSAGES.AUTH.USER_EXISTS, 500);
        }
    }

    async updateUser(id: Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null> {
        const user = await UserModel.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!user) {
            throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
        }
        return user;
    }

    async hashPassword(password: string): Promise<string> {
        return hashPassword(password);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return comparePassword(password, hashedPassword);
    }

    async generateToken(payload: { userId: Types.ObjectId; role: string }): Promise<string> {
        return signToken(payload);
    }

    // REFRESH TOKEN METHODS - UNCOMMENT AFTER REFACTORING
    async generateTokenPair(payload: { userId: Types.ObjectId; role: string }): Promise<{ accessToken: string; refreshToken: string }> {
        const tokenPayload = { userId: payload.userId.toString(), role: payload.role };
        const { accessToken, refreshToken } = generateTokenPair(tokenPayload);
        
        // Store refresh token in database with expiration
        const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await this.storeRefreshToken(payload.userId, refreshToken, refreshTokenExpiresAt);
        
        return { accessToken, refreshToken };
    }

    async storeRefreshToken(userId: Types.ObjectId, refreshToken: string, expiresAt: Date): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            refreshToken: refreshToken,
            refreshTokenExpiresAt: expiresAt
        });
    }

    async validateRefreshToken(refreshToken: string): Promise<{ userId: string; role: string }> {
        try {
            // Check if token is blacklisted
            if (RefreshTokenService.isTokenBlacklisted(refreshToken)) {
                throw new AppError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN, 401);
            }

            // Verify the refresh token signature and expiration
            const decoded = verifyRefreshToken(refreshToken) as { userId: string; role: string };
            
            // Check if refresh token exists in database and is not expired
            const user = await UserModel.findById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                throw new AppError(MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND, 401);
            }
            
            if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
                throw new AppError(MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED, 401);
            }
            
            return { userId: decoded.userId, role: decoded.role };
        } catch (error) {
            throw new AppError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN, 401);
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const { userId, role } = await this.validateRefreshToken(refreshToken);
        
        // Blacklist the old refresh token
        RefreshTokenService.blacklistToken(refreshToken);
        RefreshTokenService.removeUserSession(userId, refreshToken);
        
        // Generate new token pair
        const newTokens = await this.generateTokenPair({ userId: new Types.ObjectId(userId), role });
        
        // Add new refresh token to user sessions
        RefreshTokenService.addUserSession(userId, newTokens.refreshToken);
        
        return newTokens;
    }

    async revokeRefreshToken(userId: Types.ObjectId): Promise<void> {
        const user = await UserModel.findById(userId);
        if (user && user.refreshToken) {
            // Blacklist the current refresh token
            RefreshTokenService.blacklistToken(user.refreshToken);
            RefreshTokenService.removeUserSession(userId.toString(), user.refreshToken);
        }
        
        await UserModel.findByIdAndUpdate(userId, {
            refreshToken: null,
            refreshTokenExpiresAt: null
        });
    }

    async revokeAllRefreshTokens(userId: Types.ObjectId): Promise<void> {
        // Blacklist all user sessions
        RefreshTokenService.removeAllUserSessions(userId.toString());
        
        // Clear refresh token from database
        await UserModel.findByIdAndUpdate(userId, {
            refreshToken: null,
            refreshTokenExpiresAt: null
        });
    }
}
import { NextFunction, Request, Response } from "express";
import { AuthUseCase } from "../business/auth/auth.usecase";
import { LoginDto, RegisterDto } from "../interfaces/auth.dto";
import { validate } from "class-validator";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";
import { Types } from "mongoose";

export class AuthController {
    constructor (private authUseCase: AuthUseCase) {}

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginDto = new LoginDto();
            Object.assign(loginDto, req.body);
            const errors = await validate(loginDto);
            if (errors.length > 0) {
                throw new AppError(errors.map(err => err.toString()).join(", "), 400);
            }

            const { token, user } = await this.authUseCase.login(loginDto);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });

            res.status(200).json({ message: MESSAGES.AUTH.SUCCESS_LOGIN, token, user });
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const registerDto = new RegisterDto();
            Object.assign(registerDto, req.body);
            const errors = await validate(registerDto);
            if (errors.length > 0) {
                throw new AppError(errors.map(err => err.toString()).join(", "), 400);
            }

            await this.authUseCase.register(registerDto);
            res.status(201).json({ message: MESSAGES.AUTH.SUCCESS_REGISTER });
        } catch (error) {
            next(error);
        }
    }

    async approveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
            }

            const updatedUser = await this.authUseCase.approveUser(new Types.ObjectId(userId));
            res.status(200).json({ message: MESSAGES.AUTH.SUCCESS_APPROVE, user: updatedUser });
        } catch (error) {
            next(error);
        }
    }

    async checkRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
            }

            const role = await this.authUseCase.checkRole(new Types.ObjectId(userId));
            res.status(200).json({ role });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.authUseCase.logout();
            res.clearCookie("token").json({ message: MESSAGES.AUTH.SUCCESS_LOGOUT });
        } catch (error) {
            next(error);
        }
    }

    // REFRESH TOKEN CONTROLLER METHODS - UNCOMMENT AFTER REFACTORING
    async loginWithRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginDto = new LoginDto();
            Object.assign(loginDto, req.body);
            const errors = await validate(loginDto);
            if (errors.length > 0) {
                throw new AppError(errors.map(err => err.toString()).join(", "), 400);
            }

            const { accessToken, refreshToken, user } = await this.authUseCase.loginWithRefreshToken(loginDto);
            
            // Set access token as HTTP-only cookie (short-lived)
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            // Set refresh token as HTTP-only cookie (long-lived)
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({ 
                message: MESSAGES.AUTH.SUCCESS_LOGIN, 
                accessToken, 
                refreshToken,
                user 
            });
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                throw new AppError(MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED, 401);
            }

            const { accessToken, refreshToken: newRefreshToken } = await this.authUseCase.refreshToken(refreshToken);
            
            // Set new access token as HTTP-only cookie
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            // Set new refresh token as HTTP-only cookie
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({ 
                message: MESSAGES.AUTH.SUCCESS_TOKEN_REFRESH,
                accessToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    async logoutWithRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (userId) {
                await this.authUseCase.logoutWithRefreshToken(new Types.ObjectId(userId));
            }
            
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ message: MESSAGES.AUTH.SUCCESS_LOGOUT });
        } catch (error) {
            next(error);
        }
    }

    async logoutAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
            }

            await this.authUseCase.logoutAllDevices(new Types.ObjectId(userId));
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ message: MESSAGES.AUTH.SUCCESS_LOGOUT });
        } catch (error) {
            next(error);
        }
    }
}
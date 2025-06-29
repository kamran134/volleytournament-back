import { Types } from "mongoose";
import UserModel, { IUser } from "../models/user.model";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";
import { comparePassword, hashPassword } from "../utils/hash.utils";
import { signToken } from "../utils/jwt.utils";

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
}
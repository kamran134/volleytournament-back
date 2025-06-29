import { Request } from 'express';
import User, { IUser } from '../models/user.model';
import { UserFilterDto } from '../interfaces/user.dto';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { hashPassword } from '../utils/hash.utils';

export class UserService {
    async getFilteredUsers(filter: UserFilterDto): Promise<{ data: IUser[], totalCount: number }> {
        try {
            const query: any = {};
            if (filter.role) {
                query.role = filter.role;
            }
            if (filter.isApproved !== undefined) {
                query.isApproved = filter.isApproved;
            }

            const totalCount: number = await User.countDocuments(query);
            const data: IUser[] = await User.find(query)
                .sort({ createdAt: -1 });

            return { data, totalCount };
        } catch (error) {
            throw new AppError(MESSAGES.USER.FETCH_FAILED, 500);
        }
    }

    async getUserById(id: string): Promise<IUser | null> {
        try {
            const user: IUser | null = await User.findById(id);
            if (!user) {
                throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
            }
            return user;
        } catch (error) {
            throw new AppError(MESSAGES.USER.FETCH_FAILED, 500);
        }
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            const user: IUser | null = await User.findOne({ email });
            return user;
        } catch (error) {
            throw new AppError(MESSAGES.USER.FETCH_FAILED, 500);
        }
    }

    async createUser(userData: Partial<IUser>): Promise<IUser> {
        try {
            const existingUser: IUser | null = await this.getUserByEmail(userData.email!);
            if (existingUser) {
                throw new AppError(MESSAGES.USER.USER_EXISTS, 400);
            }
            if (userData.password) {
                userData.passwordHash = await hashPassword(userData.password);
                delete userData.password; // Remove password from the data to avoid saving it in plain text
            }
            return await User.create(userData);
        } catch (error: any) {
            if (error.code === 11000) { // Duplicate key error
                throw new AppError(MESSAGES.USER.USER_EXISTS, 400);
            }
            throw new AppError(MESSAGES.USER.CREATE_FAILED, 500);
        }
    }

    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
        if (updateData.password) {
            updateData.passwordHash = await hashPassword(updateData.password);
            delete updateData.password;
        }
        const updatedUser: IUser | null = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
        }
        return updatedUser;
    }

    async deleteUser(id: string): Promise<IUser> {
        const deletedUser: IUser | null = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
        }
        return deletedUser;
    }
}
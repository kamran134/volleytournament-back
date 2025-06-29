import bcrypt from 'bcrypt';
import { AppError } from './errors';

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new AppError('Password hashing failed', 500);
    }
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new AppError('Password comparison failed', 500);
    }
}
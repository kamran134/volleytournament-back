import { Types } from "mongoose";
import { MESSAGES } from "../../constants/messages";
import { LoginDto, RegisterDto } from "../../interfaces/auth.dto";
import { AuthService } from "../../services/auth.service";
import { AppError } from "../../utils/errors";
import { UserRole } from "../../constants/roles";

export class AuthUseCase {
    constructor(private authService: AuthService) {}

    async login(dto: LoginDto): Promise<{ token: string; user: any }> {
        const user = await this.authService.findUserByEmail(dto.email);
        if (!user) {
            throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 404);
        }

        const isPasswordValid = await this.authService.comparePassword(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, 400);
        }

        if (!user.isApproved) {
            throw new AppError(MESSAGES.AUTH.NOT_APPROVED, 403);
        }

        const token = await this.authService.generateToken({
            userId: user._id as Types.ObjectId,
            role: user.role,
        });

        return { token, user };
    }

    async register(dto: RegisterDto): Promise<void> {
        const existingUser = await this.authService.findUserByEmail(dto.email);
        if (existingUser) {
            throw new AppError(MESSAGES.AUTH.USER_EXISTS, 400);
        }

        if (!dto.password || dto.password.length < 6) {
            throw new AppError(MESSAGES.AUTH.INVALID_PASSWORD, 400);
        }

        const passwordHash = await this.authService.hashPassword(dto.password);
        await this.authService.createUser({
            email: dto.email,
            passwordHash,
            role: dto.role || UserRole.USER,
            isApproved: dto.role === UserRole.SUPERADMIN
        });
    }

    async approveUser(userId: Types.ObjectId): Promise<any> {
        const user = await this.authService.findUserById(userId);
        if (!user) {
            throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
        }

        const updatedUser = await this.authService.updateUser(userId, { isApproved: true });
        if (!updatedUser) {
            throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
        }
        return { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role };
    }

    async checkRole(userId: Types.ObjectId): Promise<string> {
        const user = await this.authService.findUserById(userId);
        if (!user) {
        throw new AppError(MESSAGES.AUTH.USER_NOT_FOUND, 404);
        }
        return user.role;
    }

    async logout(): Promise<void> {
        // Логика очистки токена на стороне сервера, если нужно (например, blacklisting)
        // В случае JWT, обычно не требуется, так как токен сам по себе не хранится на сервере
        // Можно просто удалить токен на клиенте
        // Например, если используется куки, то можно установить куку с пустым значением и истечением срока действия
        // res.cookie("token", "", { expires: new Date(0), httpOnly: true, secure: true, sameSite: "strict", path: "/" });
        // Но это зависит от реализации клиента
        // В данном случае, просто возвращаем успешный ответ
        return Promise.resolve();
    }
}
import { MESSAGES } from "../../constants/messages";
import { UserRole } from "../../constants/roles";
import { CreateUserDto, UpdateUserDto, UserFilterDto } from "../../interfaces/user.dto";
import { IUser } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import { AppError } from "../../utils/errors";

export class UserUseCase {
    constructor(private userService: UserService) {}

    async getUsers(filter: UserFilterDto): Promise<{ data: IUser[]; totalCount: number }> {
        return this.userService.getFilteredUsers(filter);
    }

    async createUser(dto: CreateUserDto): Promise<IUser> {
        if (dto.role === UserRole.SUPERADMIN) {
            throw new AppError(MESSAGES.USER.SUPERADMIN_ASSIGN_RESTRICTED, 403);
        }
        return this.userService.createUser(dto);
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<IUser> {
        const user = await this.userService.getUserById(id);
        if (user && user.role === UserRole.SUPERADMIN) {
            throw new AppError(MESSAGES.USER.SUPERADMIN_RESTRICTED, 403);
        }
        if (dto.role === UserRole.SUPERADMIN) {
            throw new AppError(MESSAGES.USER.SUPERADMIN_ASSIGN_RESTRICTED, 403);
        }
        if (!user) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
        }
        return this.userService.updateUser(id, dto);
    }

    async deleteUser(id: string): Promise<IUser> {
        const user = await this.userService.getUserById(id);
        if (user && user.role === UserRole.SUPERADMIN) {
            throw new AppError(MESSAGES.USER.SUPERADMIN_RESTRICTED, 403);
        }
        if (!user) {
            throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
        }
        return this.userService.deleteUser(id);
    }
}
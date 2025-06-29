import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { MESSAGES } from "../constants/messages";
import { UserRole } from "../constants/roles";

export class CreateUserDto {
    @IsEmail({}, { message: MESSAGES.USER.INVALID_EMAIL })
    email!: string;

    @IsString({ message: MESSAGES.USER.INVALID_PASSWORD })
    @MinLength(6, { message: MESSAGES.USER.INVALID_PASSWORD_LENGTH })
    password!: string;

    @IsOptional()
    @IsEnum(UserRole, { message: MESSAGES.USER.INVALID_ROLE })
    role?: UserRole;

    @IsOptional()
    isApproved?: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, { message: MESSAGES.USER.INVALID_EMAIL })
    email?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.USER.INVALID_PASSWORD })
    @MinLength(6, { message: MESSAGES.USER.INVALID_PASSWORD_LENGTH })
    password?: string;

    @IsOptional()
    @IsEnum(UserRole, { message: MESSAGES.USER.INVALID_ROLE })
    role?: UserRole;

    @IsOptional()
    isApproved?: boolean;
}

export class UserFilterDto {
    @IsOptional()
    @IsEnum(UserRole, { message: MESSAGES.USER.INVALID_ROLE })
    role?: UserRole;

    @IsOptional()
    isApproved?: boolean;
}
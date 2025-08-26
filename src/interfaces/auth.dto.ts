import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../constants/roles";

export class LoginDto {
    @IsEmail({}, { message: "Email düzgün formatda deyil!" })
    email!: string;

    @IsString({ message: "Parol təqdim edilməyib və ya düzgün formatda deyil!" })
    @MinLength(6, { message: "Parol ən azı 6 simvoldan ibarət olmalıdır!" })
    password!: string;
}

export class RegisterDto {
    @IsEmail({}, { message: "Email düzgün formatda deyil!" })
    email!: string;

    @IsString({ message: "Parol təqdim edilməyib və ya düzgün formatda deyil!" })
    @MinLength(6, { message: "Parol ən azı 6 simvoldan ibarət olmalıdır!" })
    password!: string;

    @IsOptional()
    @IsEnum(UserRole, { message: "Rol düzgün formatda deyil!" })
    role?: UserRole;
}

// REFRESH TOKEN DTO - UNCOMMENT AFTER REFACTORING
export class RefreshTokenDto {
    @IsString({ message: "Refresh token təqdim edilməyib və ya düzgün formatda deyil!" })
    refreshToken!: string;
}
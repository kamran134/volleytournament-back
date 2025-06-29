import { IsBoolean, IsDate, IsEmail, IsMongoId, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { MESSAGES } from "../constants/messages";

export class CreateGamerDto {
    @IsNumber({}, { message: MESSAGES.GAMER.INCORRECT_NUMBER })
    number!: number;

    @IsString({ message: MESSAGES.GAMER.INVALID_NAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_NAME_LENGTH })
    firstName!: string;

    @IsString({ message: MESSAGES.GAMER.INVALID_SURNAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_SURNAME_LENGTH })
    lastName!: string;

    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_MIDDLENAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_MIDDLENAME_LENGTH })
    middleName?: string;

    @IsOptional()
    @IsEmail({}, { message: MESSAGES.GAMER.INVALID_EMAIL })
    email?: string;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.GAMER.INVALID_HEIGHT })
    height?: number;

    @IsDate({ message: MESSAGES.GAMER.INVALID_BIRTHDATE })
    birthDate!: Date;

    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCaptain!: boolean;

    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCoach!: boolean;

    @IsMongoId({ message: MESSAGES.GAMER.INVALID_TEAM })
    team!: string;
}

export class UpdateGamerDto {
    @IsOptional()
    @IsNumber({}, { message: MESSAGES.GAMER.INCORRECT_NUMBER })
    number?: number;

    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_NAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_NAME_LENGTH })
    firstName?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_SURNAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_SURNAME_LENGTH })
    lastName?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_MIDDLENAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_MIDDLENAME_LENGTH })
    middleName?: string;

    @IsOptional()
    @IsEmail({}, { message: MESSAGES.GAMER.INVALID_EMAIL })
    email?: string;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.GAMER.INVALID_HEIGHT })
    height?: number;

    @IsOptional()
    @IsDate({ message: MESSAGES.GAMER.INVALID_BIRTHDATE })
    birthDate?: Date;

    @IsOptional()
    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCaptain?: boolean;

    @IsOptional()
    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCoach?: boolean;

    @IsMongoId({ message: MESSAGES.GAMER.INVALID_TEAM })
    team!: string;
}

export class GamerFilterDto {
    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_SURNAME })
    lastName?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_NAME })
    firstName?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAMER.INVALID_TEAM })
    team?: string;

    @IsOptional()
    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCaptain?: boolean;

    @IsOptional()
    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCoach?: boolean;
}
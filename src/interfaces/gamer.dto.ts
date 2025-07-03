import { Allow, IsBoolean, IsDateString, IsEmail, IsMongoId, IsNumberString, IsOptional, IsString, MinLength } from "class-validator";
import { MESSAGES } from "../constants/messages";
import { Transform } from "class-transformer";

export class CreateGamerDto {
    @IsNumberString({}, { message: MESSAGES.GAMER.INCORRECT_NUMBER })
    number!: string;

    @IsString({ message: MESSAGES.GAMER.INVALID_NAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_NAME_LENGTH })
    firstName!: string;

    @IsString({ message: MESSAGES.GAMER.INVALID_SURNAME })
    @MinLength(2, { message: MESSAGES.GAMER.INVALID_SURNAME_LENGTH })
    lastName!: string;

    @IsOptional()
    @IsString({ message: MESSAGES.GAMER.INVALID_MIDDLENAME })
    middleName?: string;

    @IsOptional()
    @IsNumberString({}, { message: MESSAGES.GAMER.INVALID_HEIGHT })
    height?: string;

    @IsDateString({}, { message: MESSAGES.GAMER.INVALID_BIRTHDATE })
    birthDate!: string;

    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCaptain!: boolean;

    @IsBoolean({ message: MESSAGES.GAMER.INVALID_ROLE })
    isCoach!: boolean;

    @IsMongoId({ message: MESSAGES.GAMER.INVALID_TEAM })
    team!: string;
}

export class UpdateGamerDto {
    @IsOptional()
    @IsNumberString({}, { message: MESSAGES.GAMER.INCORRECT_NUMBER })
    number?: string;

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
    @Transform(({ value }) => (value === '' ? undefined : value))
    middleName?: string;

    @IsOptional()
    @IsNumberString({}, { message: MESSAGES.GAMER.INVALID_HEIGHT })
    height?: string;

    @IsOptional()
    @IsDateString({}, { message: MESSAGES.GAMER.INVALID_BIRTHDATE })
    birthDate?: string;

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
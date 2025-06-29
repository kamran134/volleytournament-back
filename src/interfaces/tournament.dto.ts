import { IsString, MinLength, IsArray, IsMongoId, IsDateString, IsOptional } from 'class-validator';
import { MESSAGES } from '../constants/messages';

export class CreateTournamentDto {
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_NAME })
    @MinLength(3, { message: MESSAGES.TOURNAMENT.INVALID_NAME_LENGTH })
    name!: string;

    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_SHORT_NAME })
    @MinLength(2, { message: MESSAGES.TOURNAMENT.INVALID_SHORT_NAME_LENGTH })
    shortName!: string;

    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_LOGO_URL })
    @IsOptional()
    logoUrl?: string;

    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_COUNTRY })
    country!: string;

    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_CITY })
    city!: string;

    @IsDateString({}, { message: MESSAGES.TOURNAMENT.INVALID_START_DATE })
    startDate!: string;

    @IsDateString({}, { message: MESSAGES.TOURNAMENT.INVALID_END_DATE })
    endDate!: string;

    @IsOptional()
    @IsArray({ message: MESSAGES.TOURNAMENT.INVALID_TEAMS_FORMAT })
    @IsMongoId({ each: true, message: MESSAGES.TOURNAMENT.INVALID_TEAM_ID })
    teams?: string[];
}

export class UpdateTournamentDto {
    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_NAME })
    @MinLength(3, { message: MESSAGES.TOURNAMENT.INVALID_NAME_LENGTH })
    name?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_SHORT_NAME })
    @MinLength(2, { message: MESSAGES.TOURNAMENT.INVALID_SHORT_NAME_LENGTH })
    shortName?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_LOGO_URL })
    logoUrl?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_COUNTRY })
    country?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_CITY })
    city?: string;

    @IsOptional()
    @IsDateString({}, { message: MESSAGES.TOURNAMENT.INVALID_START_DATE })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: MESSAGES.TOURNAMENT.INVALID_END_DATE })
    endDate?: string;

    @IsOptional()
    @IsArray({ message: MESSAGES.TOURNAMENT.INVALID_TEAMS_FORMAT })
    @IsMongoId({ each: true, message: MESSAGES.TOURNAMENT.INVALID_TEAM_ID })
    teams?: string[];
}

export class TournamentFilterDto {
    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_COUNTRY })
    country?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TOURNAMENT.INVALID_CITY })
    city?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.TOURNAMENT.INVALID_TEAM_ID })
    team?: string;
}
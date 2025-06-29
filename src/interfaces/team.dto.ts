// import { IsOptional, IsString } from "class-validator";
import { MESSAGES } from "../constants/messages";
import { IsString, MinLength, IsOptional, IsMongoId, IsArray } from 'class-validator';

export class CreateTeamDto {
    @IsString({ message: MESSAGES.TEAM.INVALID_NAME })
    @MinLength(3, { message: MESSAGES.TEAM.INVALID_NAME_LENGTH })
    name!: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_SHORT_NAME })
    @MinLength(2, { message: MESSAGES.TEAM.INVALID_SHORT_NAME_LENGTH })
    shortName?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_LOGO_URL })
    logoUrl?: string;

    @IsString({ message: MESSAGES.TEAM.INVALID_COUNTRY })
    country!: string;

    @IsString({ message: MESSAGES.TEAM.INVALID_CITY })
    city!: string;

    @IsOptional()
    @IsArray({ message: MESSAGES.TEAM.INVALID_PLAYERS_FORMAT })
    @IsMongoId({ each: true, message: MESSAGES.TEAM.INVALID_PLAYER_ID })
    players?: string[];

    @IsOptional()
    @IsArray({ message: MESSAGES.TEAM.INVALID_COACHES_FORMAT })
    @IsMongoId({ each: true, message: MESSAGES.TEAM.INVALID_COACH_ID })
    coaches?: string[];

    @IsOptional()
    @IsMongoId({ message: MESSAGES.TEAM.INVALID_CAPTAIN_ID })
    captain?: string;
}

export class UpdateTeamDto {
    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_NAME })
    @MinLength(3, { message: MESSAGES.TEAM.INVALID_NAME_LENGTH })
    name?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_SHORT_NAME })
    @MinLength(2, { message: MESSAGES.TEAM.INVALID_SHORT_NAME_LENGTH })
    shortName?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_LOGO_URL })
    logoUrl?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_COUNTRY })
    country?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_CITY })
    city?: string;

    @IsOptional()
    @IsArray({ message: MESSAGES.TEAM.INVALID_PLAYERS_FORMAT })
    @IsMongoId({ each: true, message: MESSAGES.TEAM.INVALID_PLAYER_ID })
    players?: string[];

    @IsOptional()
    @IsArray({ message: MESSAGES.TEAM.INVALID_COACHES_FORMAT })
    @IsMongoId({ each: true, message: MESSAGES.TEAM.INVALID_COACH_ID })
    coaches?: string[];

    @IsOptional()
    @IsMongoId({ message: MESSAGES.TEAM.INVALID_CAPTAIN_ID })
    captain?: string;
}

export class TeamFilterDto {
    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_COUNTRY })
    country?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.TEAM.INVALID_CITY })
    city?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.TEAM.INVALID_CAPTAIN_ID })
    captain?: string;
}
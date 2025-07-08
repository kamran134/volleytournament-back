import { IsString, MinLength, IsDateString, IsOptional, IsMongoId, IsArray } from 'class-validator';
import { MESSAGES } from '../constants/messages';

export class CreateGameDto {
    @IsString({ message: MESSAGES.GAME.INVALID_NAME })
    name!: string;

    @IsDateString({}, { message: MESSAGES.GAME.INVALID_START_DATE })
    startDate!: string;

    @IsDateString({}, { message: MESSAGES.GAME.INVALID_END_DATE })
    endDate!: string;

    @IsMongoId({ message: MESSAGES.GAME.INVALID_TOURNAMENT })
    tournament!: string;                    

    @IsMongoId({ message: MESSAGES.GAME.INVALID_TEAM_A })
    team1!: string;

    @IsMongoId({ message: MESSAGES.GAME.INVALID_TEAM_B })
    team2!: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_WINNER })
    winner?: string;
}

export class UpdateGameDto {
    @IsOptional()
    @IsString({ message: MESSAGES.GAME.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsDateString({}, { message: MESSAGES.GAME.INVALID_START_DATE })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: MESSAGES.GAME.INVALID_END_DATE })
    endDate?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_TOURNAMENT })
    tournament?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_TEAM_A })
    team1?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_TEAM_B })
    team2?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_WINNER })
    winner?: string;
}

export class GameFilterDto {
    @IsOptional()
    @IsString({ message: MESSAGES.GAME.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_WINNER_ID })
    winner?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.GAME.INVALID_TOURNAMENT_ID })
    tournament?: string;
}
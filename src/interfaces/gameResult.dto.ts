import { IsNumber, IsMongoId } from 'class-validator';
import { MESSAGES } from '../constants/messages';

export class CreateGameResultDto {
    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_GAME_ID })
    game!: string;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    team1!: string;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    team2!: string;

    @IsNumber({}, { message: MESSAGES.GAME_RESULT.INVALID_SCORE })
    scoreTeam1!: number;

    @IsNumber({}, { message: MESSAGES.GAME_RESULT.INVALID_SCORE })
    scoreTeam2!: number;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    winner!: string;
}

export class UpdateGameResultDto {
    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_GAME_ID })
    game?: string;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    team1?: string;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    team2?: string;

    @IsNumber({}, { message: MESSAGES.GAME_RESULT.INVALID_SCORE })
    scoreTeam1?: number;

    @IsNumber({}, { message: MESSAGES.GAME_RESULT.INVALID_SCORE })
    scoreTeam2?: number;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    winner?: string;
}

export class GameResultFilterDto {
    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_GAME_ID })
    game?: string;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    team?: string;

    @IsMongoId({ message: MESSAGES.GAME_RESULT.INVALID_TEAM_ID })
    winner?: string;
}
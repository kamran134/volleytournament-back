import { Types } from 'mongoose';
import { GameResultService } from '../../services/gameResult.service';
import { CreateGameResultDto, UpdateGameResultDto, GameResultFilterDto } from '../../interfaces/gameResult.dto';
import { AppError } from '../../utils/errors';
import { MESSAGES } from '../../constants/messages';
import GameResultModel, { IGameResult } from '../../models/gameResult.model';
import GameModel from '../../models/game.model';
import TeamModel from '../../models/team.model';

export class GameResultUseCase {
    constructor(private gameResultService: GameResultService) { }

    async getGameResults(filter: GameResultFilterDto): Promise<{ data: IGameResult[]; totalCount: number }> {
        return this.gameResultService.getFilteredGameResults(filter);
    }

    async createGameResult(dto: CreateGameResultDto): Promise<IGameResult> {
        const game = await GameModel.findById(dto.game);
        if (!game) {
            throw new AppError(MESSAGES.GAME_RESULT.GAME_NOT_FOUND, 400);
        }
        const team1 = await TeamModel.findById(dto.team1);
        const team2 = await TeamModel.findById(dto.team2);
        if (!team1 || !team2) {
            throw new AppError(MESSAGES.GAME_RESULT.TEAMS_NOT_FOUND, 400);
        }
        if (dto.winner !== dto.team1 && dto.winner !== dto.team2) {
            throw new AppError(MESSAGES.GAME_RESULT.INVALID_WINNER, 400);
        }

        const gameResultData: Partial<IGameResult> = {
            ...dto,
            game: new Types.ObjectId(dto.game),
            team1: new Types.ObjectId(dto.team1),
            team2: new Types.ObjectId(dto.team2),
            winner: new Types.ObjectId(dto.winner),
        };

        return this.gameResultService.createGameResult(gameResultData);
    }

    async updateGameResult(id: string, dto: UpdateGameResultDto): Promise<IGameResult> {
        if (dto.game) {
            const game = await GameModel.findById(dto.game);
            if (!game) {
                throw new AppError(MESSAGES.GAME_RESULT.GAME_NOT_FOUND, 400);
            }
        }
        if (dto.team1 || dto.team2) {
            const team1 = dto.team1 ? await TeamModel.findById(dto.team1) : null;
            const team2 = dto.team2 ? await TeamModel.findById(dto.team2) : null;
            if ((dto.team1 && !team1) || (dto.team2 && !team2)) {
                throw new AppError(MESSAGES.GAME_RESULT.TEAMS_NOT_FOUND, 400);
            }
        }
        if (dto.winner && (dto.team1 || dto.team2)) {
            const team1Id = dto.team1 || (await GameResultModel.findById(id))?.team1;
            const team2Id = dto.team2 || (await GameResultModel.findById(id))?.team2;
            if (!team1Id || !team2Id || (dto.winner !== team1Id.toString() && dto.winner !== team2Id.toString())) {
                throw new AppError(MESSAGES.GAME_RESULT.INVALID_WINNER, 400);
            }
        }

        const gameResultData: Partial<IGameResult> = {
            ...dto,
            game: dto.game ? new Types.ObjectId(dto.game) : undefined,
            team1: dto.team1 ? new Types.ObjectId(dto.team1) : undefined,
            team2: dto.team2 ? new Types.ObjectId(dto.team2) : undefined,
            winner: dto.winner ? new Types.ObjectId(dto.winner) : undefined,
        };

        return this.gameResultService.updateGameResult(id, gameResultData);
    }

    async deleteGameResult(id: string): Promise<IGameResult> {
        return this.gameResultService.deleteGameResult(id);
    }
}
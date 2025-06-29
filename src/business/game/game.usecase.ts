import { GameService } from '../../services/game.service';
import { CreateGameDto, UpdateGameDto, GameFilterDto } from '../../interfaces/game.dto';
import { AppError } from '../../utils/errors';
import { MESSAGES } from '../../constants/messages';
import { IGame } from '../../models/game.model';
import { Types } from 'mongoose';

export class GameUseCase {
    constructor(private gameService: GameService) { }

    async getGames(filter: GameFilterDto): Promise<{ data: IGame[]; totalCount: number }> {
        return this.gameService.getFilteredGames(filter);
    }

    async createGame(dto: CreateGameDto): Promise<IGame> {
        const gameData: Partial<IGame> = {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
            teamA: new Types.ObjectId(dto.teamA),
            teamB: new Types.ObjectId(dto.teamB),
            winner: dto.winner ? new Types.ObjectId(dto.winner) : undefined,
        };

        return this.gameService.createGame(gameData);
    }

    async updateGame(id: string, dto: UpdateGameDto): Promise<IGame> {
        const gameData: Partial<IGame> = {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
            teamA: dto.teamA ? new Types.ObjectId(dto.teamA) : undefined,
            teamB: dto.teamB ? new Types.ObjectId(dto.teamB) : undefined,
            winner: dto.winner ? new Types.ObjectId(dto.winner) : undefined,
        };

        return this.gameService.updateGame(id, gameData);
    }

    async deleteGame(id: string): Promise<IGame> {
        return this.gameService.deleteGame(id);
    }
}
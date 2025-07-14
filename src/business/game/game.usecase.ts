import { GameService } from '../../services/game.service';
import { CreateGameDto, UpdateGameDto, GameFilterDto } from '../../interfaces/game.dto';
import { IGame } from '../../models/game.model';
import { Types } from 'mongoose';

export class GameUseCase {
    constructor(private gameService: GameService) { }

    async getGames(filter: GameFilterDto): Promise<{ data: IGame[]; totalCount: number }> {
        return this.gameService.getFilteredGames(filter);
    }

    async getGame(id: string): Promise<IGame | null> {
        return this.gameService.getGameById(id);
    }

    async createGame(dto: CreateGameDto): Promise<IGame> {
        const gameData: Partial<IGame> = {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
            team1: new Types.ObjectId(dto.team1),
            team2: new Types.ObjectId(dto.team2),
        };

        return this.gameService.createGame(gameData);
    }

    async updateGame(id: string, dto: UpdateGameDto): Promise<IGame> {
        const gameData: Partial<IGame> = {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
            team1: dto.team1 ? new Types.ObjectId(dto.team1) : undefined,
            team2: dto.team2 ? new Types.ObjectId(dto.team2) : undefined,
        };

        return this.gameService.updateGame(id, gameData);
    }

    async deleteGame(id: string): Promise<IGame> {
        return this.gameService.deleteGame(id);
    }
}
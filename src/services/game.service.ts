import { IGame } from '../models/game.model';
import GameModel from '../models/game.model';
import TeamModel from '../models/team.model';
import TournamentModel from '../models/tournament.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger';

export class GameService {
    async getFilteredGames(filter: any): Promise<{ data: IGame[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
            if (filter.winner) query.winner = filter.winner;

            const totalCount = await GameModel.countDocuments(query);
            const data = await GameModel.find(query).populate('tournament team1 team2 winner').sort({ startDate: -1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching games:', error);
            throw new AppError(MESSAGES.GAME.FETCH_FAILED, 500);
        }
    }

    async getGameById(id: string): Promise<IGame> {
        const game = await GameModel.findById(id).populate('tournament team1 team2 winner');
        if (!game) {
            throw new AppError(MESSAGES.GAME.NOT_FOUND, 404);
        }
        return game;
    }

    async createGame(data: Partial<IGame>): Promise<IGame> {
        try {
            if (data.winner) {
                const winner = await TeamModel.findById(data.winner);
                if (!winner) {
                    throw new AppError(MESSAGES.GAME.TEAMS_NOT_FOUND, 400);
                }
            }

            if (data.team1 && data.team2) {
                const teamA = await TeamModel.findById(data.team1);
                const teamB = await TeamModel.findById(data.team2);
                if (!teamA || !teamB) {
                    throw new AppError(MESSAGES.GAME.TEAMS_NOT_FOUND, 400);
                }
                if (teamA._id.equals(teamB._id)) {
                    throw new AppError(MESSAGES.GAME.SAME_TEAMS, 400);
                }
            }
            const tournament = await TournamentModel.findById(data.tournament);
            if (!tournament) {
                throw new AppError(MESSAGES.GAME.TOURNAMENT_NOT_FOUND, 400);
            }
            
            return await GameModel.create(data);
        } catch (error: any) {
            logger.error('Error creating game:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.GAME.INVALID_DATA, 400);
            }
            throw new AppError(MESSAGES.GAME.CREATE_FAILED, 500);
        }
    }

    async updateGame(id: string, data: Partial<IGame>): Promise<IGame> {
        if (data.winner) {
            const winner = await TeamModel.findById(data.winner);
            if (!winner) {
                throw new AppError(MESSAGES.GAME.WINNER_NOT_FOUND, 400);
            }
        }

        if (data.team1 && data.team2) {
            const teamA = await TeamModel.findById(data.team1);
            const teamB = await TeamModel.findById(data.team2);
            if (!teamA || !teamB) {
                throw new AppError(MESSAGES.GAME.TEAMS_NOT_FOUND, 400);
            }
            if (teamA._id.equals(teamB._id)) {
                throw new AppError(MESSAGES.GAME.SAME_TEAMS, 400);
            }
        }

        const tournament = await GameModel.findById(data.tournament);
        if (!tournament) {
            throw new AppError(MESSAGES.GAME.TOURNAMENT_NOT_FOUND, 400);
        }

        const updatedGame = await GameModel.findByIdAndUpdate(id, data, { new: true }).populate('gameResults winner');
        if (!updatedGame) {
            throw new AppError(MESSAGES.GAME.NOT_FOUND, 404);
        }
        return updatedGame;
    }

    async deleteGame(id: string): Promise<IGame> {
        const deletedGame = await GameModel.findByIdAndDelete(id);
        if (!deletedGame) {
            throw new AppError(MESSAGES.GAME.NOT_FOUND, 404);
        }
        return deletedGame;
    }
}
import { IGame } from '../models/game.model';
import GameModel from '../models/game.model';
import TeamModel from '../models/team.model';
import TournamentModel from '../models/tournament.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger';
import { GameFilterDto } from '../interfaces/game.dto';

export class GameService {
    async getFilteredGames(filter: GameFilterDto): Promise<{ data: IGame[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
            if (filter.winner) query.winner = filter.winner;

            const totalCount = await GameModel.countDocuments(query);

            // if isLastTournament or isLastTour is true, we need to filter by the latest tournament or tour
            if (filter.isLastTournament) {
                const latestTournament = await TournamentModel.findOne().sort({ startDate: -1 }).select('_id');
                if (latestTournament) {
                    query.tournament = latestTournament._id;
                } else {
                    query.tournament = null; // No tournaments found
                }
            }
            if (filter.isLastTour) {
                // we need to find the latest tournament before today
                const latestTour = await GameModel.findOne({ startDate: { $lt: new Date() } }).sort({ startDate: -1 }).select('tour');
                if (latestTour && latestTour.tour) {
                    query.tour = latestTour.tour._id;
                    
                } else {
                    query.tour = null; // No tours found
                }
            }

            const data = await GameModel.find(query).populate('tournament tour team1 team2 winner').sort({ startDate: -1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching games:', error);
            throw new AppError(MESSAGES.GAME.FETCH_FAILED, 500);
        }
    }

    async getGameById(id: string): Promise<IGame> {
        const game = await GameModel.findById(id).populate('tournament tour team1 team2 winner location');
        if (!game) {
            throw new AppError(MESSAGES.GAME.NOT_FOUND, 404);
        }
        return game;
    }

    async getUpcomingGames(): Promise<IGame[]> {
        try {
            const upcomingGames = await GameModel.find({ startDate: { $gte: new Date() } })
                .populate('tournament tour team1 team2 winner location')
                .sort({ startDate: 1 });
            return upcomingGames;
        } catch (error) {
            logger.error('Error fetching upcoming games:', error);
            throw new AppError(MESSAGES.GAME.FETCH_FAILED, 500);
        }
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

        const tournament = await TournamentModel.findById(data.tournament);
        if (!tournament) {
            throw new AppError(MESSAGES.GAME.TOURNAMENT_NOT_FOUND, 400);
        }

        const updatedGame = await GameModel.findByIdAndUpdate(id, data, { new: true }).populate('tournament team1 team2 winner');
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
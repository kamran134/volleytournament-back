import { Types } from 'mongoose';
import { IGameResult } from '../models/gameResult.model';
import GameResultModel from '../models/gameResult.model';
import GameModel from '../models/game.model';
import TeamModel from '../models/team.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger';
import { GameResultFilterDto } from '../interfaces/gameResult.dto';

export class GameResultService {
    async getFilteredGameResults(filter: GameResultFilterDto): Promise<{ data: IGameResult[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.game) query.game = filter.game;
            if (filter.team) query.$or = [{ team1: filter.team }, { team2: filter.team }];
            if (filter.winner) query.winner = filter.winner;

            const totalCount = await GameResultModel.countDocuments(query);
            const data = await GameResultModel.find(query).populate('game team1 team2 winner').sort({ createdAt: -1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching game results:', error);
            throw new AppError(MESSAGES.GAME_RESULT.FETCH_FAILED, 500);
        }
    }

    async getGameResultById(id: string): Promise<IGameResult> {
        const gameResult = await GameResultModel.findById(id).populate('game team1 team2 winner');
        if (!gameResult) {
            throw new AppError(MESSAGES.GAME_RESULT.NOT_FOUND, 404);
        }
        return gameResult;
    }

    async createGameResult(data: Partial<IGameResult>): Promise<IGameResult> {
        try {
            const game = await GameModel.findById(data.game);
            if (!game) {
                throw new AppError(MESSAGES.GAME_RESULT.GAME_NOT_FOUND, 400);
            }
            const team1 = await TeamModel.findById(data.team1);
            const team2 = await TeamModel.findById(data.team2);
            if (!team1 || !team2) {
                throw new AppError(MESSAGES.GAME_RESULT.TEAMS_NOT_FOUND, 400);
            }
            if (data.winner && ![data.team1!.toString(), data.team2!.toString()].includes(data.winner.toString())) {
                throw new AppError(MESSAGES.GAME_RESULT.INVALID_WINNER, 400);
            }
            return await GameResultModel.create(data);
        } catch (error: any) {
            logger.error('Error creating game result:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.GAME_RESULT.INVALID_DATA, 400);
            }
            throw error instanceof AppError ? error : new AppError(MESSAGES.GAME_RESULT.CREATE_FAILED, 500);
        }
    }

    async updateGameResult(id: string, data: Partial<IGameResult>): Promise<IGameResult> {
        if (data.game) {
            const game = await GameModel.findById(data.game);
            if (!game) {
                throw new AppError(MESSAGES.GAME_RESULT.GAME_NOT_FOUND, 400);
            }
        }
        if (data.team1 || data.team2) {
            const team1 = data.team1 ? await TeamModel.findById(data.team1) : null;
            const team2 = data.team2 ? await TeamModel.findById(data.team2) : null;
            if ((data.team1 && !team1) || (data.team2 && !team2)) {
                throw new AppError(MESSAGES.GAME_RESULT.TEAMS_NOT_FOUND, 400);
            }
        }
        if (data.winner && (data.team1 || data.team2)) {
            const team1Id = data.team1 || (await GameResultModel.findById(id))?.team1;
            const team2Id = data.team2 || (await GameResultModel.findById(id))?.team2;
            if (!team1Id || !team2Id || ![team1Id.toString(), team2Id.toString()].includes(data.winner.toString())) {
                throw new AppError(MESSAGES.GAME_RESULT.INVALID_WINNER, 400);
            }
        }
        const updatedGameResult = await GameResultModel.findByIdAndUpdate(id, data, { new: true }).populate('game team1 team2 winner');
        if (!updatedGameResult) {
            throw new AppError(MESSAGES.GAME_RESULT.NOT_FOUND, 404);
        }
        return updatedGameResult;
    }

    async deleteGameResult(id: string): Promise<IGameResult> {
        const deletedGameResult = await GameResultModel.findByIdAndDelete(id);
        if (!deletedGameResult) {
            throw new AppError(MESSAGES.GAME_RESULT.NOT_FOUND, 404);
        }
        return deletedGameResult;
    }
}
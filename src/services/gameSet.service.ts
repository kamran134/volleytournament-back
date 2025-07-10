import { MESSAGES } from "../constants/messages";
import { GamerFilterDto } from "../interfaces/gamer.dto";
import { CreateGameSetDto } from "../interfaces/gameSet.dto";
import GameModel from "../models/game.model";
import TeamModel from "../models/team.model";
import GameSetModel, { IGameSet } from "../models/gameSet.model";
import { AppError } from "../utils/errors";
import { Types } from "mongoose";
import { logger } from "../utils/logger";

export class GameSetService {
    // This service will handle the game set logic, including creating, updating, and retrieving game sets.
    // It will interact with the Game and GameResult models to manage the game sets.
    
    // Example method to create a game set
    async createGameSet(data: Partial<IGameSet>): Promise<IGameSet> {
        try {
            const { game, team1, team2, winner } = data;

            // Checking input data
            const existingGame = await GameModel.findById(game);
            if (!existingGame) {
                throw new AppError(MESSAGES.GAME_SET.GAME_NOT_FOUND, 404);
            }
            const existingTeam1 = await TeamModel.findById(team1);
            const existingTeam2 = await TeamModel.findById(team2);
            if (!existingTeam1) {
                throw new AppError(MESSAGES.GAME_SET.TEAM1_NOT_FOUND, 404);
            }
            if (!existingTeam2) {
                throw new AppError(MESSAGES.GAME_SET.TEAM2_NOT_FOUND, 404);
            }
            if (winner && ![team1, team2].includes(winner)) {
                throw new AppError(MESSAGES.GAME_SET.INVALID_WINNER, 400);
            }
            // Create the game set
            return await GameSetModel.create(data);
            
        } catch (error: any) {
            logger.error('Error creating game set:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.GAME_SET.INVALID_DATA, 400);
            }
            throw error instanceof AppError ? error : new AppError(MESSAGES.GAME_SET.CREATE_FAILED, 500);
        }
    }

    // Example method to update a game set
    async updateGameSet(id: string, data: Partial<IGameSet>): Promise<IGameSet> {
        try {
            const { game, team1, team2, winner } = data;
            const gameSet = await GameSetModel.findById(id);
            if (!gameSet) {
                throw new AppError(MESSAGES.GAME_SET.NOT_FOUND, 404);
            }
            
            const existingGame = await GameModel.findById(game);
            if (game && !existingGame) {
                throw new AppError(MESSAGES.GAME_SET.GAME_NOT_FOUND, 404);
            }

            const existingTeam1 = await TeamModel.findById(team1);
            if (team1 && !existingTeam1) {
                throw new AppError(MESSAGES.GAME_SET.TEAM1_NOT_FOUND, 404);
            }

            const existingTeam2 = await TeamModel.findById(team2);
            if (team2 && !existingTeam2) {
                throw new AppError(MESSAGES.GAME_SET.TEAM2_NOT_FOUND, 404);
            }

            if (winner && ![team1, team2].includes(winner)) {
                throw new AppError(MESSAGES.GAME_SET.INVALID_WINNER, 400);
            }

            // Update the game set with the provided data
            const updatedGameSet = await GameSetModel.findByIdAndUpdate(id, data, { new: true })
                .populate('game gameResult team1 team2 winner');
            
            if (!updatedGameSet) {
                throw new AppError(MESSAGES.GAME_SET.NOT_FOUND, 404);
            }
            return updatedGameSet;
        } catch (error: any) {
            logger.error('Error updating game set:', error);
            throw error instanceof AppError ? error : new AppError(MESSAGES.GAME_SET.UPDATE_FAILED, 500);
        }
    }

    // Example method to retrieve a game set by ID
    async getGameSetsByGameId(gameId: string): Promise<any> {
        // Logic to retrieve a game set by its ID
    }
    
    async deleteGameSet(id: string): Promise<void> {
        // Logic to delete a game set by its ID
        // This will involve removing the game set from the database and possibly cleaning up related data
    }

    // Example method to filter game sets based on criteria
    //async filterGameSets(filterDto: GamerFilterDto): Promise<any[]> {
        // Logic to filter game sets based on the provided criteria
    //}
}
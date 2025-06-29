import { Request, Response, NextFunction } from 'express';
import { GameResultUseCase } from '../business/gameResult/gameResult.usecase';
import { CreateGameResultDto, UpdateGameResultDto, GameResultFilterDto } from '../interfaces/gameResult.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';

export class GameResultController {
    constructor(private gameResultUseCase: GameResultUseCase) { }

    async getGameResults(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new GameResultFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.gameResultUseCase.getGameResults(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.GAME_RESULT.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createGameResult(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateGameResultDto();
            Object.assign(createDto, req.body);
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.gameResultUseCase.createGameResult(createDto);
            res.status(201).json({ message: MESSAGES.GAME_RESULT.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateGameResult(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.body;
            if (!id) {
                throw new AppError(MESSAGES.GAME_RESULT.INVALID_ID, 400);
            }

            const updateDto = new UpdateGameResultDto();
            Object.assign(updateDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.gameResultUseCase.updateGameResult(id, updateDto);
            res.status(200).json({ message: MESSAGES.GAME_RESULT.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteGameResult(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError(MESSAGES.GAME_RESULT.INVALID_ID, 400);
            }

            await this.gameResultUseCase.deleteGameResult(id);
            res.status(200).json({ message: MESSAGES.GAME_RESULT.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
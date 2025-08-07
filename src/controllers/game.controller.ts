import { Request, Response, NextFunction } from 'express';
import { GameUseCase } from '../business/game/game.usecase';
import { CreateGameDto, UpdateGameDto, GameFilterDto } from '../interfaces/game.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { plainToClass } from 'class-transformer';

export class GameController {
    constructor(private gameUseCase: GameUseCase) { }

    async getGames(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new GameFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.gameUseCase.getGames(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.GAME.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async getLastGames(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = plainToClass(GameFilterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.gameUseCase.getGames(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.GAME.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async getGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new AppError(MESSAGES.GAME.INVALID_ID, 400);
            }

            const game = await this.gameUseCase.getGame(id);
            if (!game) {
                throw new AppError(MESSAGES.GAME.NOT_FOUND, 404);
            }
            res.status(200).json({ data: game, message: MESSAGES.GAME.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async getUpcomingGames(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const upcomingGames = await this.gameUseCase.getUpcomingGames();
            res.status(200).json({ data: upcomingGames, message: MESSAGES.GAME.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateGameDto();
            Object.assign(createDto, req.body);
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.gameUseCase.createGame(createDto);
            res.status(201).json({ message: MESSAGES.GAME.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.body._id;
            if (!id) {
                throw new AppError(MESSAGES.GAME.INVALID_ID, 400);
            }

            const updateDto = new UpdateGameDto();
            Object.assign(updateDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const game = await this.gameUseCase.updateGame(id, updateDto);
            res.status(200).json({ data: game, message: MESSAGES.GAME.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteGame(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError(MESSAGES.GAME.INVALID_ID, 400);
            }

            const deletedGame = await this.gameUseCase.deleteGame(id);
            res.status(200).json({ data: deletedGame, message: MESSAGES.GAME.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
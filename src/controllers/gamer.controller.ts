import { Request, Response, NextFunction } from 'express';
import { GamerUseCase } from '../business/gamer/gamer.usecase';
import { CreateGamerDto, UpdateGamerDto, GamerFilterDto } from '../interfaces/gamer.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';

export class GamerController {
    constructor(private gamerUseCase: GamerUseCase) { }

    async getGamers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new GamerFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.gamerUseCase.getGamers(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.GAMER.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createGamer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateGamerDto();
            Object.assign(createDto, req.body);
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.gamerUseCase.createGamer(createDto);
            res.status(201).json({ message: MESSAGES.GAMER.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateGamer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.body._id;
            if (!id) {
                throw new AppError(MESSAGES.GAMER.INVALID_ID, 400);
            }

            const updateDto = new UpdateGamerDto();
            Object.assign(updateDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.gamerUseCase.updateGamer(id, updateDto);
            res.status(200).json({ message: MESSAGES.GAMER.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteGamer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError(MESSAGES.GAMER.INVALID_ID, 400);
            }

            await this.gamerUseCase.deleteGamer(id);
            res.status(200).json({ message: MESSAGES.GAMER.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
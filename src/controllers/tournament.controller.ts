import { Request, Response, NextFunction } from 'express';
import { TournamentUseCase } from '../business/tournament/tournament.usecase';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFilterDto } from '../interfaces/tournament.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { plainToClass } from 'class-transformer';
import mongoose from 'mongoose';

export class TournamentController {
    constructor(private tournamentUseCase: TournamentUseCase) { }

    async getTournaments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new TournamentFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.tournamentUseCase.getTournaments(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.TOURNAMENT.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async getTournamentByShortName(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const shortName = req.params.shortName;
            if (!shortName) {
                throw new AppError(MESSAGES.TOURNAMENT.INVALID_SHORT_NAME, 400);
            }

            const tournament = await this.tournamentUseCase.getTournamentByShortName(shortName);
            if (!tournament) {
                throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 404);
            }
            res.status(200).json({ data: tournament, message: MESSAGES.TOURNAMENT.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateTournamentDto();
            Object.assign(createDto, req.body);

            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.tournamentUseCase.createTournament(createDto, req.file);
            res.status(201).json({ message: MESSAGES.TOURNAMENT.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // const id = req.body._id;

            // if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            //     throw new AppError(MESSAGES.TOURNAMENT.INVALID_ID, 400);
            // }

            // const updateDto = new UpdateTournamentDto();
            // Object.assign(updateDto, req.body);

            const updateDto = plainToClass(UpdateTournamentDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.tournamentUseCase.updateTournament(updateDto, req.file);
            res.status(200).json({ message: MESSAGES.TOURNAMENT.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError(MESSAGES.TOURNAMENT.INVALID_ID, 400);
            }

            await this.tournamentUseCase.deleteTournament(id);
            res.status(200).json({ message: MESSAGES.TOURNAMENT.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }

    async uploadTournamentLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                throw new AppError(MESSAGES.TOURNAMENT.LOGO_UPLOAD_FAILED, 400);
            }

            const logoUrl = await this.tournamentUseCase.uploadTournamentLogo(req.body._id, req.file);

            res.status(200).json({ message: MESSAGES.TOURNAMENT.SUCCESS_UPLOAD_LOGO, logoUrl });
        } catch (error) {
            next(error);
        }
    }
}
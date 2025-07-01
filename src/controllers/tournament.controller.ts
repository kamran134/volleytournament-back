import { Request, Response, NextFunction } from 'express';
import { TournamentUseCase } from '../business/tournament/tournament.usecase';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFilterDto } from '../interfaces/tournament.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';

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

    async createTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateTournamentDto();
            Object.assign(createDto, req.body);
            
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.tournamentUseCase.createTournament(createDto);
            res.status(201).json({ message: MESSAGES.TOURNAMENT.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateTournament(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.body._id;

            if (!id) {
                throw new AppError(MESSAGES.TOURNAMENT.INVALID_ID, 400);
            }

            const updateDto = new UpdateTournamentDto();
            Object.assign(updateDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.tournamentUseCase.updateTournament(id, updateDto);
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
}
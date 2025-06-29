import { Request, Response, NextFunction } from 'express';
import { TeamUseCase } from '../business/team/team.usecase';
import { CreateTeamDto, UpdateTeamDto, TeamFilterDto } from '../interfaces/team.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';

export class TeamController {
    constructor(private teamUseCase: TeamUseCase) { }

    async getTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new TeamFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.teamUseCase.getTeams(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.TEAM.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateTeamDto();
            Object.assign(createDto, req.body);
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.teamUseCase.createTeam(createDto);
            res.status(201).json({ message: MESSAGES.TEAM.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.body;
            if (!id) {
                throw new AppError(MESSAGES.TEAM.INVALID_ID, 400);
            }

            const updateDto = new UpdateTeamDto();
            Object.assign(updateDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            await this.teamUseCase.updateTeam(id, updateDto);
            res.status(200).json({ message: MESSAGES.TEAM.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError(MESSAGES.TEAM.INVALID_ID, 400);
            }

            await this.teamUseCase.deleteTeam(id);
            res.status(200).json({ message: MESSAGES.TEAM.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
import { NextFunction, Request, Response } from 'express';
import { UserUseCase } from '../business/user/user.usecase';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from '../interfaces/user.dto';
import { validate } from 'class-validator';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';

export class UserController {
    constructor(private userUseCase: UserUseCase) {}

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new UserFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map(err => err.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.userUseCase.getUsers(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.USER.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createUserDto = new CreateUserDto();
            Object.assign(createUserDto, req.body);
            const errors = await validate(createUserDto);
            if (errors.length > 0) {
                throw new AppError(errors.map(err => err.toString()).join(', '), 400);
            }

            const user = await this.userUseCase.createUser(createUserDto);
            res.status(201).json({ user, message: MESSAGES.USER.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.body.id;
            if (!userId) {
                throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
            }

            const updateUserDto = new UpdateUserDto();
            Object.assign(updateUserDto, req.body);
            const errors = await validate(updateUserDto);
            if (errors.length > 0) {
                throw new AppError(errors.map(err => err.toString()).join(', '), 400);
            }

            const user = await this.userUseCase.updateUser(userId, updateUserDto);
            res.status(200).json({ user, message: MESSAGES.USER.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
            }

            const user = await this.userUseCase.deleteUser(userId);
            res.status(200).json({ user, message: MESSAGES.USER.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
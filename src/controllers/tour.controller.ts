import { NextFunction, Request, Response } from "express";
import { TourUseCase } from "../business/tour/tour.usecase";
import { MESSAGES } from "../constants/messages";
import { CreateTourDto, TourFilterDto, UpdateTourDto } from "../interfaces/tour.dto";
import { validate } from "class-validator";
import { AppError } from "../utils/errors";
import { plainToClass } from "class-transformer";

export class TourController {
    constructor(private tourUseCase: TourUseCase) { }

    async getTours(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = plainToClass(TourFilterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.tourUseCase.getTours(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.TOUR.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async getTour(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new AppError(MESSAGES.TOUR.INVALID_ID, 400);
            }

            const tour = await this.tourUseCase.getTour(id);
            if (!tour) {
                throw new AppError(MESSAGES.TOUR.NOT_FOUND, 404);
            }
            res.status(200).json({ data: tour, message: MESSAGES.TOUR.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async getToursWithGames(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const toursWithGames = await this.tourUseCase.getToursWithGames();
            res.status(200).json({ data: toursWithGames, message: MESSAGES.TOUR.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createTour(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = plainToClass(CreateTourDto, req.body);
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const newTour = await this.tourUseCase.createTour(createDto);
            res.status(201).json({ data: newTour, message: MESSAGES.TOUR.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateTour(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.body._id;
            if (!id) {
                throw new AppError(MESSAGES.TOUR.INVALID_ID, 400);
            }

            const updateDto = plainToClass(UpdateTourDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const updatedTour = await this.tourUseCase.updateTour(id, updateDto);
            res.status(200).json({ data: updatedTour, message: MESSAGES.TOUR.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteTour(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError(MESSAGES.TOUR.INVALID_ID, 400);
            }

            const deletedTour = await this.tourUseCase.deleteTour(id);
            res.status(200).json({ data: deletedTour, message: MESSAGES.TOUR.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
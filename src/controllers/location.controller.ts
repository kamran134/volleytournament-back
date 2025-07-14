import { NextFunction, Request, Response } from "express";
import { LocationUseCase } from "../business/location/location.usecase";
import { CreateLocationDto, LocationFilterDto, UpdateLocationDto } from "../interfaces/location.dto";
import { ILocation } from "../models/location.model";
import { validate } from "class-validator";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";

export class LocationController {
    constructor(private locationUseCase: LocationUseCase) { }

    async createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createDto = new CreateLocationDto();
            Object.assign(createDto, req.body);
            const errors = await validate(createDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }
            await this.locationUseCase.createLocation(createDto);
            res.status(200).json({ message: MESSAGES.LOCATION.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.body._id;
            if (!id) {
                throw new AppError(MESSAGES.LOCATION.INVALID_ID, 400);
            }

            const updateDto = new UpdateLocationDto();
            Object.assign(updateDto, req.body);
            const errors = await validate(updateDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }
            await this.locationUseCase.updateLocation(id, updateDto);
            res.status(200).json({ message: MESSAGES.LOCATION.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deleteLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new AppError(MESSAGES.LOCATION.INVALID_ID, 400);
            }
            await this.locationUseCase.deleteLocation(id);
            res.status(200).json({ message: MESSAGES.LOCATION.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }

    async getLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new AppError(MESSAGES.LOCATION.INVALID_ID, 400);
            }
            const location = await this.locationUseCase.getLocation(id);
            res.status(200).json(location);
        } catch (error) {
            next(error);
        }
    }

    async getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = new LocationFilterDto();
            Object.assign(filterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.locationUseCase.getLocations(filterDto);
            res.status(200).json({ data, totalCount });
        } catch (error) {
            next(error);
        }
    }
}
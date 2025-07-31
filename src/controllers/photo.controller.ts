import { NextFunction, Request, Response } from "express";
import { PhotoUseCase } from "../business/photo/photo.usecase";
import { CreatePhotoDto, PhotoFilterDto } from "../interfaces/photo.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";

export class PhotoController {
    constructor(private photoUseCase: PhotoUseCase) {}

    async getPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filterDto = plainToClass(PhotoFilterDto, req.query);
            const errors = await validate(filterDto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const { data, totalCount } = await this.photoUseCase.getPhotos(filterDto);
            res.status(200).json({ data, totalCount, message: MESSAGES.PHOTO.SUCCESS_FETCH });
        } catch (error) {
            next(error);
        }
    }

    async createPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = plainToClass(CreatePhotoDto, req.body);
            const errors = await validate(dto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            if (!req.file) {
                throw new AppError(MESSAGES.PHOTO.NOT_FOUND, 400);
            }
            const photo = await this.photoUseCase.createPhoto(dto, req.file);
            res.status(201).json({ data: photo, message: MESSAGES.PHOTO.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async createPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = plainToClass(CreatePhotoDto, req.body);
            const errors = await validate(dto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            if (!req.files || req.files.length === 0) {
                throw new AppError(MESSAGES.PHOTO.NOT_FOUND, 400);
            }
            const photos = await this.photoUseCase.createPhotos(dto, req.files as Express.Multer.File[]);
            res.status(201).json({ data: photos, message: MESSAGES.PHOTO.SUCCESS_CREATE });
        } catch (error) {
            next(error);
        }
    }

    async updatePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto = plainToClass(CreatePhotoDto, req.body);
            const errors = await validate(dto);
            if (errors.length > 0) {
                throw new AppError(errors.map((e) => e.toString()).join(', '), 400);
            }

            const photo = await this.photoUseCase.updatePhoto(dto, req.file);
            res.status(200).json({ data: photo, message: MESSAGES.PHOTO.SUCCESS_UPDATE });
        } catch (error) {
            next(error);
        }
    }

    async deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) {
                throw new AppError(MESSAGES.PHOTO.INVALID_ID, 400);
            }

            await this.photoUseCase.deletePhoto(id);
            res.status(200).json({ message: MESSAGES.PHOTO.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }

    async deletePhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ids = req.body.ids;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                throw new AppError(MESSAGES.PHOTO.INVALID_IDS, 400);
            }

            await this.photoUseCase.deletePhotos(ids);
            res.status(200).json({ message: MESSAGES.PHOTO.SUCCESS_DELETE });
        } catch (error) {
            next(error);
        }
    }
}
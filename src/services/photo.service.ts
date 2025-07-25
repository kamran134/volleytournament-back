import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { IPhoto } from '../models/photo.model';
import TournamentModel from '../models/tournament.model';
import TourModel from '../models/tour.model';
import TeamModel from '../models/team.model';
import { MESSAGES } from '../constants/messages';
import mongoose, { Types } from 'mongoose';
import PhotoModel from '../models/photo.model';

export class PhotoService {
    constructor() {}

    async getPhotoByUrl(photoUrl: string): Promise<string | null> {
        try {
            const filePath = path.join(__dirname, '../../', photoUrl);
            if (fs.existsSync(filePath)) {
                return photoUrl;
            }
        } catch (error) {
            logger.error('Error getting photo by URL:', error);
        }
        return null;
    }

    async getPhotosByUrls(photoUrls: string[]): Promise<string[]> {
        const existingPhotos: string[] = [];
        for (const photoUrl of photoUrls) {
            const photo = await this.getPhotoByUrl(photoUrl);
            if (photo) {
                existingPhotos.push(photo);
            }
        }
        return existingPhotos;
    }

    async getFilteredPhotos(filter: any): Promise<{ data: IPhoto[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.tournament) query.tournament = filter.tournament;
            if (filter.tour) query.tour = filter.tour;
            if (filter.team) query.team = filter.team;

            const totalCount = await PhotoModel.countDocuments(query);
            const data = await PhotoModel.find(query).populate('tournament tour team').sort({ createdAt: -1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching photos:', error);
            throw new AppError(MESSAGES.PHOTO.FETCH_FAILED, 500);
        }
    }

    async createPhoto(data: Partial<IPhoto>, file: Express.Multer.File): Promise<IPhoto> {
        try {
            const photoUrl = await this.uploadPhoto(file, 'photos');
            const photoData: Partial<IPhoto> = {
                ...data,
                url: photoUrl,
            };
            return await PhotoModel.create(photoData);
        } catch (error) {
            logger.error('Error creating photo:', error);
            throw new AppError(MESSAGES.PHOTO.CREATE_FAILED, 500);
        }
    }

    async uploadPhoto(file: Express.Multer.File, type: string): Promise<string> {
        try {
            const uploadDir = path.join(__dirname, '../../uploads', type);
            await fs.promises.mkdir(uploadDir, { recursive: true });

            const fileName = `${Date.now()}-${file.originalname}`;
            const outputPath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .resize({ width: 800 })
                .webp({ quality: 80 })
                .toFile(outputPath);

            return `/uploads/${type}/${fileName}`;
        } catch (error) {
            logger.error('Error uploading photo:', error);
            throw new AppError(MESSAGES.PHOTO.UPLOAD_FAILED, 500);
        }
    }

    async uploadMultiplePhotos(data: Partial<IPhoto>, files: Express.Multer.File[]): Promise<IPhoto[]> {
        try {
            // Проверяем существование связанных сущностей
            const [tournament, tour, team] = await Promise.all([
                TournamentModel.findById(data.tournament),
                TourModel.findById(data.tour),
                TeamModel.findById(data.team),
            ]);

            if (!tournament) {
                throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 404);
            }
            if (!tour) {
                throw new AppError(MESSAGES.TOUR.NOT_FOUND, 404);
            }
            if (!team) {
                throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
            }

            // Подготавливаем директорию для загрузки
            const uploadDir = path.join(__dirname, '../../uploads/photos');
            await fs.promises.mkdir(uploadDir, { recursive: true });

            // Обрабатываем каждый файл
            const photoPromises = files.map(async (file) => {
                const fileName = `${Date.now()}-${data.tournament}-${new Types.ObjectId().toString()}.webp`;
                const outputPath = path.join(uploadDir, fileName);

                // Обработка изображения
                await sharp(file.buffer)
                    .resize({ width: 800 })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                const photoUrl = `/uploads/photos/${fileName}`;

                // Создаём запись для фотки
                const photoData: Partial<IPhoto> = {
                    id: new mongoose.Types.ObjectId().toString(),
                    url: photoUrl,
                    description: data.description || '',
                    tournament: data.tournament,
                    tour: data.tour,
                    team: data.team,
                };

                return PhotoModel.create(photoData);
            });

            // Ждём завершения всех операций
            const photos = await Promise.all(photoPromises);

            return photos;
        } catch (error) {
            logger.error('Error uploading multiple photos:', error);
            throw new AppError(MESSAGES.PHOTO.UPLOAD_FAILED, 500);
        }
    }

    async updatePhoto(data: Partial<IPhoto>, file?: Express.Multer.File): Promise<IPhoto> {
        if (!data._id) {
            throw new AppError(MESSAGES.PHOTO.INVALID_ID, 400);
        }

        try {
            const photo = await PhotoModel.findById(data._id);
            if (!photo) {
                throw new AppError(MESSAGES.PHOTO.NOT_FOUND, 404);
            }

            // Обновляем данные фото
            Object.assign(photo, data);
            await photo.save();

            // Если есть новый файл, загружаем его
            if (file) {
                const photoUrl = await this.uploadPhoto(file, 'photos');
                photo.url = photoUrl;
                await photo.save();

                // Удаляем старое фото, если оно существует
                if (photo.url) {
                    await this.deletePhoto(photo.url);
                }
            }

            return photo;
        } catch (error) {
            logger.error('Error updating photo:', error);
            throw new AppError(MESSAGES.PHOTO.UPDATE_FAILED, 500);
        }
    }

    async deletePhoto(photoUrl: string | undefined): Promise<void> {
        if (!photoUrl) return;

        try {
            const filePath = path.join(__dirname, '../../', photoUrl);
            await fs.promises.unlink(filePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                logger.error('Error deleting photo:', error);
                throw new AppError('Photo delete failed', 500);
            }
        }
    }
}
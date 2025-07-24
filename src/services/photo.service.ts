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

    async uploadPhoto(file: Express.Multer.File, type: 'tournament' | 'team'): Promise<string> {
        try {
            const uploadDir = path.join(__dirname, `../../uploads/${type}s`);
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const fileName = `${Date.now()}-${file.originalname}`;
            const outputPath = path.join(uploadDir, fileName);

            await sharp(file.buffer).resize({ width: 300 }).webp({ quality: 80 }).toFile(outputPath);
            return `/uploads/${type}s/${fileName}`;
        } catch (error) {
            logger.error(`Error uploading ${type} photo:`, error);
            throw new AppError(`Photo upload failed for ${type}`, 500);
        }
    }

    async uploadPhotos(files: Express.Multer.File[], type: 'tournament' | 'team'): Promise<string[]> {
        try {
            const uploadDir = path.join(__dirname, `../../uploads/${type}s`);
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const fileUrls: string[] = [];
            for (const file of files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const outputPath = path.join(uploadDir, fileName);
                await sharp(file.buffer).resize({ width: 300 }).webp({ quality: 80 }).toFile(outputPath);
                fileUrls.push(`/uploads/${type}s/${fileName}`);
            }
            return fileUrls;
        } catch (error) {
            logger.error(`Error uploading ${type} photos:`, error);
            throw new AppError(`Photo upload failed for ${type}`, 500);
        }
    }

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
}
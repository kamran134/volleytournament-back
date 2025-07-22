import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

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
}
import { ITournament } from '../models/tournament.model';
import TournamentModel from '../models/tournament.model';
import TeamModel from '../models/team.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export class TournamentService {
    async uploadTournamentLogo(file: Express.Multer.File): Promise<string> {
        try {
            const uploadDir = path.join(__dirname, '../../uploads/tournaments');
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.webp`;
            const outputPath = path.join(uploadDir, fileName);

            await sharp(file.buffer).resize({ width: 300}).webp({ quality: 80 }).toFile(outputPath);
            return `/uploads/tournaments/${fileName}`;
        } catch (error) {
            logger.error('Error uploading tournament logo:', error);
            throw new AppError(MESSAGES.TOURNAMENT.LOGO_UPLOAD_FAILED, 500);
        }
    }
    
    async getFilteredTournaments(filter: any): Promise<{ data: ITournament[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
            if (filter.country) query.country = { $regex: filter.country, $options: 'i' };
            if (filter.city) query.city = { $regex: filter.city, $options: 'i' };
            if (filter.team) query.teams = filter.team;
            
            const totalCount = await TournamentModel.countDocuments(query);
            const data = await TournamentModel.find(query).populate('teams').sort({ startDate: -1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching tournaments:', error);
            throw new AppError(MESSAGES.TOURNAMENT.FETCH_FAILED, 500);
        }
    }

    async getTournamentById(id: string): Promise<ITournament> {
        const tournament = await TournamentModel.findById(id).populate('teams');
        if (!tournament) {
            throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 404);
        }
        return tournament;
    }

    async createTournament(data: Partial<ITournament>, file?: Express.Multer.File): Promise<ITournament> {
        try {
            if (file) {
                const logoUrl = await this.uploadTournamentLogo(file);
                data.logoUrl = logoUrl;
            }
            if (data.teams && data.teams.length > 0) {
                const teams = await TeamModel.find({ _id: { $in: data.teams } });
                if (teams.length !== data.teams.length) {
                    throw new AppError(MESSAGES.TOURNAMENT.TEAMS_NOT_FOUND, 400);
                }
            }

            if (data.logoUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(data.logoUrl)) {
                throw new AppError(MESSAGES.TOURNAMENT.INVALID_LOGO_URL, 400);
            } else if (data.logoUrl) {
                data.logoUrl = data.logoUrl.trim();
            }


            return await TournamentModel.create(data);
        } catch (error: any) {
            logger.error('Error creating tournament:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.TOURNAMENT.INVALID_DATA, 400);
            }
            throw new AppError(MESSAGES.TOURNAMENT.CREATE_FAILED, 500);
        }
    }

    async updateTournament(id: string, data: Partial<ITournament>, file?: Express.Multer.File): Promise<ITournament> {
        if (file) {
            const logoUrl = await this.uploadTournamentLogo(file);
            data.logoUrl = logoUrl;
        }
        if (data.teams && data.teams.length > 0) {
            const teams = await TeamModel.find({ _id: { $in: data.teams } });
            if (teams.length !== data.teams.length) {
                throw new AppError(MESSAGES.TOURNAMENT.TEAMS_NOT_FOUND, 400);
            }
        }
        const updatedTournament = await TournamentModel.findByIdAndUpdate(id, data, { new: true }).populate('teams');
        if (!updatedTournament) {
            throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 404);
        }
        return updatedTournament;
    }

    async deleteTournament(id: string): Promise<ITournament> {
        const deletedTournament = await TournamentModel.findByIdAndDelete(id);
        if (!deletedTournament) {
            throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 404);
        }
        return deletedTournament;
    }
}
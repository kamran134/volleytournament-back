import { ITeam } from '../models/team.model';
import TeamModel from '../models/team.model';
import GamerModel from '../models/gamer.model';
import TournamentModel from '../models/tournament.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { logger } from '../utils/logger';
//import { logger } from '../utils/errors';

export class TeamService {
    async getFilteredTeams(filter: any): Promise<{ data: ITeam[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
            if (filter.country) query.country = { $regex: filter.country, $options: 'i' };
            if (filter.city) query.city = { $regex: filter.city, $options: 'i' };
            if (filter.captain) query.captain = filter.captain;
            if (filter.createdBy) query.createdBy = filter.createdBy;

            const totalCount = await TeamModel.countDocuments(query);
            const data = await TeamModel.find(query).populate('tournaments').sort({ createdAt: -1 });
            return { data, totalCount };
        } catch (error) {
            // logger.error('Error fetching teams:', error);
            throw new AppError(MESSAGES.TEAM.FETCH_FAILED, 500);
        }
    }

    async getTeamById(id: string): Promise<ITeam> {
        const team = await TeamModel.findById(id).populate('createdBy tournaments');
        if (!team) {
            throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
        }
        return team;
    }

    async createTeam(data: Partial<ITeam>, file?: Express.Multer.File): Promise<ITeam> {
        try {
            const existingTeam = await TeamModel.findOne({ name: data.name });
            if (existingTeam) {
                throw new AppError(MESSAGES.TEAM.INVALID_DATA, 400);
            }
            if (data.tournaments && data.tournaments.length > 0) {
                const tournaments = await TournamentModel.find({ _id: { $in: data.tournaments } });
                if (tournaments.length !== data.tournaments.length) {
                    throw new AppError(MESSAGES.TEAM.INVALID_TOURNAMENTS_FORMAT, 400);
                }
            }

            const createdTeam = await TeamModel.create(data);

            if (file) {
                const logoUrl = await this.uploadTeamLogo(createdTeam._id.toString(), file);
                createdTeam.logoUrl = logoUrl;
                await createdTeam.save();
            }

            if (createdTeam._id) {
                // Update Tournament with new Team
                await TournamentModel.updateMany(
                    { _id: { $in: data.tournaments } },
                    { $addToSet: { teams: createdTeam._id } }
                );
            }

            return createdTeam;
        } catch (error: any) {
            // logger.error('Error creating team:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.TEAM.INVALID_DATA, 400);
            }
            throw new AppError(MESSAGES.TEAM.CREATE_FAILED, 500);
        }
    }

    async updateTeam(data: Partial<ITeam>, file?: Express.Multer.File): Promise<ITeam> {
        if (data.tournaments && data.tournaments.length > 0) {
            const tournaments = await TournamentModel.find({ _id: { $in: data.tournaments } });
            if (tournaments.length !== data.tournaments.length) {
                throw new AppError(MESSAGES.TEAM.INVALID_TOURNAMENTS_FORMAT, 400);
            }
        }

        const updatedTeam = await TeamModel.findByIdAndUpdate(data._id, data, { new: true }).populate('tournaments createdBy');
        if (!updatedTeam) {
            throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
        }

        if (file) {
            if (updatedTeam.logoUrl) {
                await this.deleteTeamLogo(updatedTeam.logoUrl);
            }
            const logoUrl = await this.uploadTeamLogo(updatedTeam._id.toString(), file);
            updatedTeam.logoUrl = logoUrl;
            await updatedTeam.save();
        }

        return updatedTeam;
    }

    async deleteTeam(id: string): Promise<ITeam> {
        await GamerModel.deleteMany({ team: id });
        
        const deletedTeam = await TeamModel.findByIdAndDelete(id);
        if (!deletedTeam) {
            throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
        }

        // Remove team from all tournaments
        await TournamentModel.updateMany(
            { teams: id },
            { $pull: { teams: id } }
        );
        
        return deletedTeam;
    }

    async uploadTeamLogo(id: string, file: Express.Multer.File): Promise<string> {
        try {
            const uploadDir = path.join(__dirname, '../../uploads/teams');
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const fileName = `${Date.now()}-${id}.webp`;
            const outputPath = path.join(uploadDir, fileName);

            await sharp(file.buffer).resize({ width: 300}).webp({ quality: 80 }).toFile(outputPath);
            return `/uploads/teams/${fileName}`;
        } catch (error) {
            logger.error('Error uploading team logo:', error);
            throw new AppError(MESSAGES.TEAM.LOGO_UPLOAD_FAILED, 500);
        }
    }

    async deleteTeamLogo(logoUrl: string | undefined): Promise<void> {
        if (!logoUrl) return;

        try {
            const filePath = path.join(__dirname, '../../', logoUrl);
            await fs.unlinkSync(filePath);
        } catch (error: any) {
            // Игнорируем ошибку, если файл не существует
            if (error.code !== 'ENOENT') {
                logger.error('Error deleting team logo:', error);
                throw new AppError(MESSAGES.TEAM.LOGO_DELETE_FAILED, 500);
            }
        }
    }
}
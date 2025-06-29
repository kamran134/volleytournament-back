import { IGamer } from '../models/gamer.model';
import GamerModel from '../models/gamer.model';
import TeamModel from '../models/team.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger';

export class GamerService {
    async getFilteredGamers(filter: any): Promise<{ data: IGamer[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.lastName) query.lastName = { $regex: filter.lastName, $options: 'i' };
            if (filter.firstName) query.firstName = { $regex: filter.firstName, $options: 'i' };
            if (filter.team) query.team = filter.team;
            if (filter.isCaptain !== undefined) query.isCaptain = filter.isCaptain;
            if (filter.isCoach !== undefined) query.isCoach = filter.isCoach;

            const totalCount = await GamerModel.countDocuments(query);
            const data = await GamerModel.find(query).populate('team').sort({ createdAt: -1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching gamers:', error);
            throw new AppError(MESSAGES.GAMER.FETCH_FAILED, 500);
        }
    }

    async getGamerById(id: string): Promise<IGamer> {
        const gamer = await GamerModel.findById(id).populate('team');
        if (!gamer) {
            throw new AppError(MESSAGES.GAMER.NOT_FOUND, 404);
        }
        return gamer;
    }

    async createGamer(data: Partial<IGamer>): Promise<IGamer> {
        try {
            const existingGamer = await GamerModel.findOne({ email: data.email });
            if (existingGamer) {
                throw new AppError(MESSAGES.GAMER.EMAIL_EXISTS, 400);
            }
            const team = await TeamModel.findById(data.team);
            if (!team) {
                throw new AppError(MESSAGES.GAMER.TEAM_NOT_FOUND, 400);
            }
            return await GamerModel.create(data);
        } catch (error: any) {
            logger.error('Error creating gamer:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.GAMER.EMAIL_EXISTS, 400);
            }
            throw new AppError(MESSAGES.GAMER.CREATE_FAILED, 500);
        }
    }

    async updateGamer(id: string, data: Partial<IGamer>): Promise<IGamer> {
        if (data.team) {
            const team = await TeamModel.findById(data.team);
            if (!team) {
                throw new AppError(MESSAGES.GAMER.TEAM_NOT_FOUND, 400);
            }
        }
        if (data.email) {
            const existingGamer = await GamerModel.findOne({ email: data.email, _id: { $ne: id } });
            if (existingGamer) {
                throw new AppError(MESSAGES.GAMER.EMAIL_EXISTS, 400);
            }
        }
        const updatedGamer = await GamerModel.findByIdAndUpdate(id, data, { new: true }).populate('team');
        if (!updatedGamer) {
            throw new AppError(MESSAGES.GAMER.NOT_FOUND, 404);
        }
        return updatedGamer;
    }

    async deleteGamer(id: string): Promise<IGamer> {
        const deletedGamer = await GamerModel.findByIdAndDelete(id);
        if (!deletedGamer) {
            throw new AppError(MESSAGES.GAMER.NOT_FOUND, 404);
        }
        return deletedGamer;
    }
}
import { ITournament } from '../models/tournament.model';
import TournamentModel from '../models/tournament.model';
import TeamModel from '../models/team.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
import { logger } from '../utils/logger';

export class TournamentService {
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

    async createTournament(data: Partial<ITournament>): Promise<ITournament> {
        try {
            if (data.teams && data.teams.length > 0) {
                const teams = await TeamModel.find({ _id: { $in: data.teams } });
                if (teams.length !== data.teams.length) {
                    throw new AppError(MESSAGES.TOURNAMENT.TEAMS_NOT_FOUND, 400);
                }
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

    async updateTournament(id: string, data: Partial<ITournament>): Promise<ITournament> {
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
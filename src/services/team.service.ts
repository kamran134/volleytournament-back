import { ITeam } from '../models/team.model';
import TeamModel from '../models/team.model';
import GamerModel from '../models/gamer.model';
import TournamentModel from '../models/tournament.model';
import { AppError } from '../utils/errors';
import { MESSAGES } from '../constants/messages';
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

            console.log('Fetching teams with filter:', filter);
            console.log('Query:', query);

            const totalCount = await TeamModel.countDocuments(query);
            // const data = await TeamModel.find(query).populate('players coaches captain').sort({ createdAt: -1 });
            const data = await TeamModel.find(query).populate('tournaments').sort({ createdAt: -1 });
            return { data, totalCount };
        } catch (error) {
            // logger.error('Error fetching teams:', error);
            throw new AppError(MESSAGES.TEAM.FETCH_FAILED, 500);
        }
    }

    async getTeamById(id: string): Promise<ITeam> {
        const team = await TeamModel.findById(id).populate('players coaches captain createdBy tournaments');
        if (!team) {
            throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
        }
        return team;
    }

    async createTeam(data: Partial<ITeam>): Promise<ITeam> {
        try {
            console.log('Creating team with data:', data);
            const existingTeam = await TeamModel.findOne({ name: data.name });
            if (existingTeam) {
                throw new AppError(MESSAGES.TEAM.INVALID_DATA, 400);
            }
            // const captain = await GamerModel.findById(data.captain);
            // if (!captain) {
            //     throw new AppError(MESSAGES.TEAM.CAPTAIN_NOT_FOUND, 400);
            // }
            // if (data.players && data.players.length > 0) {
            //     const players = await GamerModel.find({ _id: { $in: data.players } });
            //     if (players.length !== data.players.length) {
            //         throw new AppError(MESSAGES.TEAM.PLAYERS_NOT_FOUND, 400);
            //     }
            // }
            // if (data.coaches && data.coaches.length > 0) {
            //     const coaches = await GamerModel.find({ _id: { $in: data.coaches } });
            //     if (coaches.length !== data.coaches.length) {
            //         throw new AppError(MESSAGES.TEAM.COACHES_NOT_FOUND, 400);
            //     }
            // }
            if (data.tournaments && data.tournaments.length > 0) {
                const tournaments = await TournamentModel.find({ _id: { $in: data.tournaments } });
                if (tournaments.length !== data.tournaments.length) {
                    throw new AppError(MESSAGES.TEAM.INVALID_TOURNAMENTS_FORMAT, 400);
                }
            }

            return await TeamModel.create(data);
        } catch (error: any) {
            // logger.error('Error creating team:', error);
            if (error.code === 11000) {
                throw new AppError(MESSAGES.TEAM.INVALID_DATA, 400);
            }
            throw new AppError(MESSAGES.TEAM.CREATE_FAILED, 500);
        }
    }

    async updateTeam(id: string, data: Partial<ITeam>): Promise<ITeam> {
        // if (data.captain) {
        //     const captain = await GamerModel.findById(data.captain);
        //     if (!captain) {
        //         throw new AppError(MESSAGES.TEAM.CAPTAIN_NOT_FOUND, 400);
        //     }
        // }
        // if (data.players && data.players.length > 0) {
        //     const players = await GamerModel.find({ _id: { $in: data.players } });
        //     if (players.length !== data.players.length) {
        //         throw new AppError(MESSAGES.TEAM.PLAYERS_NOT_FOUND, 400);
        //     }
        // }
        // if (data.coaches && data.coaches.length > 0) {
        //     const coaches = await GamerModel.find({ _id: { $in: data.coaches } });
        //     if (coaches.length !== data.coaches.length) {
        //         throw new AppError(MESSAGES.TEAM.COACHES_NOT_FOUND, 400);
        //     }
        // }

        if (data.tournaments && data.tournaments.length > 0) {
            const tournaments = await TournamentModel.find({ _id: { $in: data.tournaments } });
            if (tournaments.length !== data.tournaments.length) {
                throw new AppError(MESSAGES.TEAM.INVALID_TOURNAMENTS_FORMAT, 400);
            }
        }

        const updatedTeam = await TeamModel.findByIdAndUpdate(id, data, { new: true }).populate('players coaches captain');
        if (!updatedTeam) {
            throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
        }
        return updatedTeam;
    }

    async deleteTeam(id: string): Promise<ITeam> {
        await GamerModel.deleteMany({ team: id });
        
        const deletedTeam = await TeamModel.findByIdAndDelete(id);
        if (!deletedTeam) {
            throw new AppError(MESSAGES.TEAM.NOT_FOUND, 404);
        }
        
        return deletedTeam;
    }
}
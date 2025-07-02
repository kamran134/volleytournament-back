import { TeamService } from '../../services/team.service';
import { CreateTeamDto, UpdateTeamDto, TeamFilterDto } from '../../interfaces/team.dto';
import { AppError } from '../../utils/errors';
import { MESSAGES } from '../../constants/messages';
import { ITeam } from '../../models/team.model';
import { Types } from 'mongoose';

export class TeamUseCase {
    constructor(private teamService: TeamService) { }

    async getTeams(filter: TeamFilterDto): Promise<{ data: ITeam[]; totalCount: number }> {
        return this.teamService.getFilteredTeams(filter);
    }

    async createTeam(dto: CreateTeamDto): Promise<ITeam> {
        // if (dto.captain) {
        //     const captain = await GamerModel.findById(dto.captain);
        //     if (!captain || !captain.isCaptain) {
        //         throw new AppError(MESSAGES.TEAM.CAPTAIN_NOT_FOUND, 400);
        //     }
        // }

        const teamData: Partial<ITeam> = {
            ...dto,
            tournaments: dto.tournaments ? dto.tournaments.map(id => new Types.ObjectId(id)) : undefined,
            createdBy: new Types.ObjectId(dto.createdBy),
            // captain: dto.captain ? new Types.ObjectId(dto.captain) : undefined,
            // players: dto.players ? dto.players.map(id => new Types.ObjectId(id)) : undefined,
            // coaches: dto.coaches ? dto.coaches.map(id => new Types.ObjectId(id)) : undefined,
        };
        return this.teamService.createTeam(teamData);
    }

    async updateTeam(id: string, dto: UpdateTeamDto): Promise<ITeam> {
        // if (dto.captain) {
        //     const captain = await GamerModel.findById(dto.captain);
        //     if (!captain || !captain.isCaptain) {
        //         throw new AppError(MESSAGES.TEAM.CAPTAIN_NOT_FOUND, 400);
        //     }
        // }

        const teamData: Partial<ITeam> = {
            ...dto,
            tournaments: dto.tournaments ? dto.tournaments.map(id => new Types.ObjectId(id)) : undefined,
            createdBy: dto.createdBy ? new Types.ObjectId(dto.createdBy) : undefined,
            // captain: dto.captain ? new Types.ObjectId(dto.captain) : undefined,
            // players: dto.players ? dto.players.map(id => new Types.ObjectId(id)) : undefined,
            // coaches: dto.coaches ? dto.coaches.map(id => new Types.ObjectId(id)) : undefined,
        };
        return this.teamService.updateTeam(id, teamData);
    }

    async deleteTeam(id: string): Promise<ITeam> {
        return this.teamService.deleteTeam(id);
    }
}
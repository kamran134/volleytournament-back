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

    async createTeam(dto: CreateTeamDto, file?: Express.Multer.File): Promise<ITeam> {
        const teamData: Partial<ITeam> = {
            ...dto,
            tournaments: dto.tournaments ? dto.tournaments.map(id => new Types.ObjectId(id)) : undefined,
            createdBy: new Types.ObjectId(dto.createdBy),
        };

        return this.teamService.createTeam(teamData, file);
    }

    async updateTeam(dto: UpdateTeamDto, file?: Express.Multer.File): Promise<ITeam> {
        const teamData: Partial<ITeam> = {
            ...dto,
            tournaments: dto.tournaments ? dto.tournaments.map(id => new Types.ObjectId(id)) : undefined,
            createdBy: dto.createdBy ? new Types.ObjectId(dto.createdBy) : undefined,
        };

        return this.teamService.updateTeam(teamData, file);
    }

    async deleteTeam(id: string): Promise<ITeam> {
        return this.teamService.deleteTeam(id);
    }
}
import { TournamentService } from '../../services/tournament.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFilterDto } from '../../interfaces/tournament.dto';
import { ITournament } from '../../models/tournament.model';
import { Types } from 'mongoose';

export class TournamentUseCase {
    constructor(private tournamentService: TournamentService) { }

    async getTournaments(filter: TournamentFilterDto): Promise<{ data: ITournament[]; totalCount: number }> {
        return this.tournamentService.getFilteredTournaments(filter);
    }

    async createTournament(dto: CreateTournamentDto, file?: Express.Multer.File): Promise<ITournament> {
        const tournamentData: Partial<ITournament> = {
            ...dto,
            teams: dto.teams ? dto.teams.map(id => new Types.ObjectId(id)) : undefined,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        };

        return this.tournamentService.createTournament(tournamentData, file);
    }

    async updateTournament(id: string, dto: UpdateTournamentDto, file?: Express.Multer.File): Promise<ITournament> {
        const tournamentData: Partial<ITournament> = {
            ...dto,
            teams: dto.teams ? dto.teams.map(id => new Types.ObjectId(id)) : undefined,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        };

        return this.tournamentService.updateTournament(id, tournamentData, file);
    }

    async deleteTournament(id: string): Promise<ITournament> {
        return this.tournamentService.deleteTournament(id);
    }
}
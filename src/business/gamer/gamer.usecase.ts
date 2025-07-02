import { GamerService } from '../../services/gamer.service';
import { CreateGamerDto, UpdateGamerDto, GamerFilterDto } from '../../interfaces/gamer.dto';
import { AppError } from '../../utils/errors';
import { MESSAGES } from '../../constants/messages';
import { IGamer } from '../../models/gamer.model';
import TeamModel from '../../models/team.model';
import { Types } from 'mongoose';

export class GamerUseCase {
    constructor(private gamerService: GamerService) { }

    async getGamers(filter: GamerFilterDto): Promise<{ data: IGamer[]; totalCount: number }> {
        return this.gamerService.getFilteredGamers(filter);
    }

    async createGamer(dto: CreateGamerDto): Promise<IGamer> {
        const team = await TeamModel.findById(dto.team);
        if (!team) {
            throw new AppError(MESSAGES.GAMER.TEAM_NOT_FOUND, 400);
        }

        const gamerData: Partial<IGamer> = {
            ...dto,
            number: dto.number ? parseInt(dto.number, 10) : undefined,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            middleName: dto.middleName ? dto.middleName.trim() : undefined,
            team: dto.team ? new Types.ObjectId(dto.team) : undefined,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            height: dto.height ? parseFloat(dto.height) : undefined,
        }

        return this.gamerService.createGamer(gamerData);
    }

    async updateGamer(id: string, dto: UpdateGamerDto): Promise<IGamer> {
        if (dto.team) {
            const team = await TeamModel.findById(dto.team);
            if (!team) {
                throw new AppError(MESSAGES.GAMER.TEAM_NOT_FOUND, 400);
            }
        }

        const gamerData: Partial<IGamer> = {
            ...dto,
            number: dto.number ? parseInt(dto.number, 10) : undefined,
            firstName: dto.firstName ? dto.firstName.trim() : undefined,
            lastName: dto.lastName ? dto.lastName.trim() : undefined,
            middleName: dto.middleName ? dto.middleName.trim() : undefined,
            height: dto.height ? parseFloat(dto.height) : undefined,
            team: dto.team ? new Types.ObjectId(dto.team) : undefined,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        }

        return this.gamerService.updateGamer(id, gamerData);
    }

    async deleteGamer(id: string): Promise<IGamer> {
        return this.gamerService.deleteGamer(id);
    }
}
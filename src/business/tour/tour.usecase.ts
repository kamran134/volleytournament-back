import { Types } from "mongoose";
import { CreateTourDto, UpdateTourDto } from "../../interfaces/tour.dto";
import { ITour, ITourWithGames } from "../../models/tour.model";
import { TourService } from "../../services/tour.service";

export class TourUseCase {
    constructor(private tourService: TourService) { }

    async getTours(filter: any): Promise<{ data: ITour[]; totalCount: number }> {
        return this.tourService.getFilteredTours(filter);
    }

    async getTour(id: string): Promise<ITour> {
        return this.tourService.getTourById(id);
    }

    async getToursWithGames(): Promise<ITourWithGames[]> {
        return this.tourService.getToursWithGames();
    }

    async createTour(dto: CreateTourDto): Promise<ITour> {
        const tourData: Partial<ITour> = {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
        };
        return this.tourService.createTour(tourData);
    }

    async updateTour(id: string, dto: UpdateTourDto): Promise<ITour> {
        const tourData: Partial<ITour> = {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
        };
        return this.tourService.updateTour(id, tourData);
    }

    async deleteTour(id: string): Promise<ITour> {
        return this.tourService.deleteTour(id);
    }
}
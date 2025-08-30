import TourModel, { ITour, ITourWithGames } from "../models/tour.model";
import TournamentModel from "../models/tournament.model";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";
import { logger } from "../utils/logger";
import { TourFilterDto } from "../interfaces/tour.dto";

export class TourService {
    constructor() {}

    async getFilteredTours(filter: TourFilterDto): Promise<{ data: ITour[]; totalCount: number }> {
        try {
            const query: any = {};
            if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
            if (filter.tournament) query.tournament = filter.tournament;

            const totalCount = await TourModel.countDocuments(query);
            const data = await TourModel.find(query).populate('tournament').sort({ startDate: 1 });
            return { data, totalCount };
        } catch (error) {
            logger.error('Error fetching tours:', error);
            throw new AppError(MESSAGES.TOUR.FETCH_FAILED, 500);
        }
    }

    async getTourById(id: string): Promise<ITour> {
        const tour = await TourModel.findById(id).populate('tournament');
        if (!tour) {
            throw new AppError(MESSAGES.TOUR.NOT_FOUND, 404);
        }
        return tour;
    }

    async getToursWithGames(): Promise<ITourWithGames[]> {
        return TourModel.aggregate([
            {
                $lookup: {
                    from: "games",
                    localField: "_id",
                    foreignField: "tour",
                    as: "games"
                }
            }
        ]);
    }

    async createTour(data: Partial<ITour>): Promise<ITour> {
        try {
            const tournament = await TournamentModel.findById(data.tournament);
            
            if (!tournament) {
                throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 400);
            }

            const tour = new TourModel(data);
            await tour.save();
            return tour;
        } catch (error) {
            logger.error('Error creating tour:', error);
            throw new AppError(MESSAGES.TOUR.CREATE_FAILED, 500);
        }
    }

    async updateTour(id: string, data: Partial<ITour>): Promise<ITour> {
        try {
            const tournament = await TournamentModel.findById(data.tournament);
            if (!tournament) {
                throw new AppError(MESSAGES.TOURNAMENT.NOT_FOUND, 400);
            }

            const tour = await TourModel.findByIdAndUpdate(id, data, { new: true }).populate('tournament');
            if (!tour) {
                throw new AppError(MESSAGES.TOUR.NOT_FOUND, 404);
            }

            return tour;
        } catch (error) {
            logger.error('Error updating tour:', error);
            throw new AppError(MESSAGES.TOUR.UPDATE_FAILED, 500);
        }
    }

    async deleteTour(id: string): Promise<ITour> {
        try {
            const tour = await TourModel.findByIdAndDelete(id);
            if (!tour) {
                throw new AppError(MESSAGES.TOUR.NOT_FOUND, 404);
            }
            return tour;
        } catch (error) {
            logger.error('Error deleting tour:', error);
            throw new AppError(MESSAGES.TOUR.DELETE_FAILED, 500);
        }
    }
}
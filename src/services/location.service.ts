import { MESSAGES } from "../constants/messages";
import { LocationFilterDto, UpdateLocationDto } from "../interfaces/location.dto";
import { ILocation } from "../models/location.model";
import LocationModel from "../models/location.model";
import { AppError } from "../utils/errors";

export class LocationService {
    constructor() { }

    async createLocation(data: Partial<ILocation>): Promise<ILocation> {
        try {
            const existingLocation = await LocationModel.findOne({
                name: data.name,
                address: data.address,
            });

            if (existingLocation) {
                throw new AppError(MESSAGES.LOCATION.LOCATION_ALREADY_EXISTS, 400);
            }

            const location = new LocationModel(data);
            return await location.save();
        } catch (error) {
            throw new AppError(MESSAGES.LOCATION.CREATE_FAILED, 500);
        }
    }

    async updateLocation(id: string, dto: UpdateLocationDto): Promise<ILocation> {
        try {
            const updateData: Partial<ILocation> = {
                name: dto.name,
                address: dto.address,
                url: dto.url,
            };

            const updatedLocation = await LocationModel.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedLocation) {
                throw new AppError(MESSAGES.LOCATION.NOT_FOUND, 404);
            }
            return updatedLocation;
        } catch (error) {
            throw new AppError(MESSAGES.LOCATION.UPDATE_FAILED, 500);
        }
    }

    async deleteLocation(id: string) {
        return LocationModel.findByIdAndDelete(id)
            .then(deletedLocation => {
                if (!deletedLocation) {
                    throw new AppError(MESSAGES.LOCATION.NOT_FOUND, 404);
                }
                return deletedLocation;
            })
            .catch(error => {
                throw new AppError(MESSAGES.LOCATION.DELETE_FAILED, 500);
            });
    }

    async getLocation(id: string) {
        try {
            const location = await LocationModel.findById(id);
            if (!location) {
                throw new AppError(MESSAGES.LOCATION.NOT_FOUND, 404);
            }
            return location;
        } catch (error) {
            throw new AppError(MESSAGES.LOCATION.FETCH_FAILED, 500);
        }
    }

    async getLocations(filter: LocationFilterDto): Promise<{data: ILocation[], totalCount: number; }> {
        try {
            const query: any = {};
            if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
            if (filter.address) query.address = { $regex: filter.address, $options: 'i' };
            if (filter.url) query.url = { $regex: filter.url, $options: 'i' };

            const locations = await LocationModel.find(query);
            const totalCount = await LocationModel.countDocuments(query);
            return { data: locations, totalCount };
        } catch (error) {
            throw new AppError(MESSAGES.LOCATION.FETCH_FAILED, 500);
        }
    }
}
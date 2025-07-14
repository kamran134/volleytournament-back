import { CreateLocationDto, LocationFilterDto, UpdateLocationDto } from "../../interfaces/location.dto";
import { ILocation } from "../../models/location.model";
import { LocationService } from "../../services/location.service";

export class LocationUseCase {
    constructor(private locationService: LocationService) { }

    async createLocation(dto: CreateLocationDto): Promise<ILocation> {
        const locationData: Partial<ILocation> = {
            ...dto,
            url: dto.url ? dto.url : undefined,
        };

        return this.locationService.createLocation(locationData);
    }

    async getLocations(filter: LocationFilterDto): Promise<{data:ILocation[], totalCount: number; }> {
        return this.locationService.getLocations(filter);
    }

    async getLocation(id: string): Promise<ILocation> {
        return this.locationService.getLocation(id);
    }

    async updateLocation(id: string, dto: UpdateLocationDto): Promise<ILocation> {
        return this.locationService.updateLocation(id, dto);
    }

    async deleteLocation(id: string): Promise<ILocation> {
        return this.locationService.deleteLocation(id);
    }
}
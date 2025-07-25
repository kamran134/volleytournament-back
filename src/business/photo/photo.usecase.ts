import { Types } from "mongoose";
import { CreatePhotoDto, PhotoFilterDto, UpdatePhotoDto } from "../../interfaces/photo.dto";
import { IPhoto } from "../../models/photo.model";
import { PhotoService } from "../../services/photo.service";

export class PhotoUseCase {
    constructor(private photoService: PhotoService) { }

    async getPhotos(filter: PhotoFilterDto): Promise<{ data: IPhoto[]; totalCount: number }> {
        return this.photoService.getFilteredPhotos(filter);
    }

    async createPhoto(dto: CreatePhotoDto, file: Express.Multer.File): Promise<IPhoto> {
        const photoData: Partial<IPhoto> = {
            ...dto,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
            tour: dto.tour ? new Types.ObjectId(dto.tour) : undefined,
            team: dto.team ? new Types.ObjectId(dto.team) : undefined,
        };

        return this.photoService.createPhoto(photoData, file);
    }

    async updatePhoto(dto: UpdatePhotoDto, file?: Express.Multer.File): Promise<IPhoto> {
        const photoData: Partial<IPhoto> = {
            ...dto,
            tournament: dto.tournament ? new Types.ObjectId(dto.tournament) : undefined,
            tour: dto.tour ? new Types.ObjectId(dto.tour) : undefined,
            team: dto.team ? new Types.ObjectId(dto.team) : undefined,
        };

        return this.photoService.updatePhoto(photoData, file);
    }

    async deletePhoto(id: string): Promise<void> {
        await this.photoService.deletePhoto(id);
    }
}
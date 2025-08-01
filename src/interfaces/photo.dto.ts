import { IsMongoId, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { MESSAGES } from "../constants/messages";

export class CreatePhotoDto {
    @IsOptional()
    @IsString({ message: MESSAGES.PHOTO.INVALID_DESCRIPTION })
    description?: string;

    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOURNAMENT })
    tournament!: string;

    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOUR })
    tour!: string;

    @IsOptional()
    @IsMongoId({ each: true, message: MESSAGES.PHOTO.INVALID_TEAM })
    teams?: string[];
}

export class UpdatePhotoDto {
    @IsOptional()
    @IsString({ message: MESSAGES.PHOTO.INVALID_DESCRIPTION })
    description?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOURNAMENT })
    tournament?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOUR })
    tour?: string;

    @IsOptional()
    @IsMongoId({ each: true, message: MESSAGES.PHOTO.INVALID_TEAM })
    teams?: string[];
}

export class PhotoFilterDto {
    @IsOptional()
    @IsNumberString({}, { message: MESSAGES.PHOTO.INVALID_PAGE })
    page?: number;

    @IsOptional()
    @IsNumberString({}, { message: MESSAGES.PHOTO.INVALID_SIZE })
    size?: number;

    @IsOptional()
    @IsString({ message: MESSAGES.PHOTO.INVALID_DESCRIPTION })
    description?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOURNAMENT_ID })
    tournament?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOUR_ID })
    tour?: string;

    @IsOptional()
    @IsMongoId({ each: true, message: MESSAGES.PHOTO.INVALID_TEAM_ID })
    teams?: string[];
}
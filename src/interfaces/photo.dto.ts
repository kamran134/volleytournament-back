import { IsMongoId, IsOptional, IsString } from "class-validator";
import { MESSAGES } from "../constants/messages";

export class CreatePhotoDto {
    @IsOptional()
    @IsString({ message: MESSAGES.PHOTO.INVALID_DESCRIPTION })
    description?: string;

    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOURNAMENT })
    tournament!: string;

    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TOUR })
    tour!: string;

    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TEAM })
    team!: string;
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
    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TEAM })
    team?: string;
}

export class PhotoFilterDto {
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
    @IsMongoId({ message: MESSAGES.PHOTO.INVALID_TEAM_ID })
    team?: string;
}
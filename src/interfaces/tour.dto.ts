import { IsDateString, IsMongoId, IsOptional, IsString } from "class-validator";
import { MESSAGES } from "../constants/messages";

export class CreateTourDto {
    @IsString({ message: MESSAGES.TOUR.INVALID_NAME })
    name!: string;

    @IsMongoId({ message: MESSAGES.TOUR.INVALID_TOURNAMENT })
    tournament!: string;

    @IsDateString({}, { message: MESSAGES.TOUR.INVALID_START_DATE })
    startDate!: string;

    @IsDateString({}, { message: MESSAGES.TOUR.INVALID_END_DATE })
    endDate!: string;
}

export class UpdateTourDto {
    @IsString({ message: MESSAGES.TOUR.INVALID_NAME })
    name?: string;

    @IsMongoId({ message: MESSAGES.TOUR.INVALID_TOURNAMENT })
    tournament?: string;

    @IsDateString({}, { message: MESSAGES.TOUR.INVALID_START_DATE })
    startDate?: string;

    @IsDateString({}, { message: MESSAGES.TOUR.INVALID_END_DATE })
    endDate?: string;
}

export class TourFilterDto {
    @IsOptional()
    @IsString({ message: MESSAGES.TOUR.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsMongoId({ message: MESSAGES.TOUR.INVALID_TOURNAMENT_ID })
    tournament?: string;
}
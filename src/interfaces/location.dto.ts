import { IsNumber, IsOptional, IsString } from "class-validator";
import { MESSAGES } from "../constants/messages";

export class CreateLocationDto {
    @IsString({ message: MESSAGES.LOCATION.INVALID_NAME })
    name!: string;

    @IsString({ message: MESSAGES.LOCATION.INVALID_ADDRESS })
    address!: string;

    @IsString({ message: MESSAGES.LOCATION.INVALID_URL })
    url!: string;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.LOCATION.INVALID_LATITUDE })
    latitude?: number;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.LOCATION.INVALID_LONGITUDE })
    longitude?: number;
}

export class UpdateLocationDto {
    @IsOptional()
    @IsString({ message: MESSAGES.LOCATION.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.LOCATION.INVALID_ADDRESS })
    address?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.LOCATION.INVALID_URL })
    url?: string;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.LOCATION.INVALID_LATITUDE })
    latitude?: number;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.LOCATION.INVALID_LONGITUDE })
    longitude?: number;
}

export class LocationFilterDto {
    @IsOptional()
    @IsString({ message: MESSAGES.LOCATION.INVALID_NAME })
    name?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.LOCATION.INVALID_ADDRESS })
    address?: string;

    @IsOptional()
    @IsString({ message: MESSAGES.LOCATION.INVALID_URL })
    url?: string;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.LOCATION.INVALID_LATITUDE })
    latitude?: number;

    @IsOptional()
    @IsNumber({}, { message: MESSAGES.LOCATION.INVALID_LONGITUDE })
    longitude?: number;
}
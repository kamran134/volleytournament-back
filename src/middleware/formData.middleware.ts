import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

export const parseFormDataTeams = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = {
            ...req.body,
            teams: req.body.teams ? JSON.parse(req.body.teams) : undefined, // или Object.values(req.body.teams)
        };
        req.body = parsedData;
        next();
    } catch (error) {
        next(new AppError('Invalid FormData format', 400));
    }
};

export const parseFormDataTournaments = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = {
            ...req.body,
            tournaments: req.body.tournaments ? JSON.parse(req.body.tournaments) : undefined, // или Object.values(req.body.tournaments)
        };
        req.body = parsedData;
        next();
    } catch (error) {
        next(new AppError('Invalid FormData format', 400));
    }
}

export const parseFormDataTours = (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = {
            ...req.body,
            tours: req.body.tours ? JSON.parse(req.body.tours) : undefined, // или Object.values(req.body.tours)
        };
        req.body = parsedData;
        next();
    } catch (error) {
        next(new AppError('Invalid FormData format', 400));
    }
}

// universal middleware for parsing FormData
export const parseFormData = (req: Request, res: Response, next: NextFunction, stringArrayFieldName: string) => {
    try {
        const parsedData = {
            ...req.body,
            [stringArrayFieldName]: req.body[stringArrayFieldName] ? JSON.parse(req.body[stringArrayFieldName]) : undefined,
        };
        req.body = parsedData;
        next();
    } catch (error) {
        next(new AppError(`Invalid FormData format for ${stringArrayFieldName}`, 400));
    }
}
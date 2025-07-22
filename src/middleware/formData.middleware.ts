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
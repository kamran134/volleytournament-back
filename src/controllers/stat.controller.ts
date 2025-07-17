import { NextFunction, Request, Response } from "express";
import { StatUseCase } from "../business/stat/stat.usecase";
import { AppError } from "../utils/errors";
import { MESSAGES } from "../constants/messages";

export class StatController {
    constructor(private statUseCase: StatUseCase) { }
    
    async getTournamentTable(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tournamentId = req.params.tournamentId;
            if (!tournamentId) {
                throw new AppError(MESSAGES.TOURNAMENT.INVALID_ID, 400);
            }

            const table = await this.statUseCase.getTournamentTable(tournamentId);
            if (!table) {
                throw new AppError(MESSAGES.TOURNAMENT.TABLE_NOT_FOUND, 404);
            }

            res.status(200).json({ data: table, message: "Tournament table fetched successfully" });
        } catch (error) {
            next(error);
        }
    }
}
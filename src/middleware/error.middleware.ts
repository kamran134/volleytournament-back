import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
    } else {
        console.log(err.stack);
        res.status(500).json({ message: "500: Daxili server xətası" });
    }
}
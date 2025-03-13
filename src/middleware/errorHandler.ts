import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(500).json({ message: "500: Daxili server xətası" });
}
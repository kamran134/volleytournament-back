import { Request, Response } from "express";
import Booklet, { IBookletInput } from "../models/booklet.model";

export const getBooklets = async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const size: number = parseInt(req.query.size as string) || 10;
        const skip: number = (page - 1) * size;

        const [data, totalCount] = await Promise.all([
            Booklet.find()
                .skip(skip)
                .limit(size),
            Booklet.countDocuments()
        ]);

        res.status(200).json({ data, totalCount });
    } catch (error) {
        res.status(500).json({ message: "Kitabçaların alınmasında xəta!", error });
    }
}

export const createBooklet = async (req: Request, res: Response) => {
    try {
        const { name, date } = req.body;

        const existingBooklet = await Booklet.findOne({ name, date });
        if (existingBooklet) {
            res.status(400).json({ message: "Bu kitabça artıq daxil edilib!" });
            return;
        }

        const booklet = new Booklet({
            name,
            date
        });

        const savedBooklet = await booklet.save();
        res.status(201).json(savedBooklet);
    } catch (error) {
        res.status(500).json({ message: "Kitabçanın əlavə edilməsində xəta!", error });
    }
}
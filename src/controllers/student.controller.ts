import { Request, Response } from "express";
import Student from "../models/student.model";

export const getStudents = async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const size: number = parseInt(req.query.size as string) || 10;
        const skip: number = (page - 1) * size;
        const schoolIds: string[] = req.query.schoolIds
            ? (req.query.schoolIds as string).split(',')
            : [];

        const filter: any = {};

        if (schoolIds.length > 0) {
            filter.school = { $in: schoolIds };
        }

        const [data, totalCount] = await Promise.all([
            Student.find(filter)
                .populate('teacher')
                .sort({ code: 1 })
                .skip(skip)
                .limit(size),
            Student.countDocuments(filter)
        ]);

        res.status(200).json({ data, totalCount });
    }
    catch (error) {
        res.status(500).json({ message: "Tələbələrin alınmasında xəta", error });
    }
}

export const getStudent = async (req: Request, res: Response) => {
    try {
        const student = await Student.findById(req.params.id).populate('school');
        res.status(200).json(student);
    }
    catch (error) {
        res.status(500).json({ message: "Tələbə tapılmadı!", error });
    }
}
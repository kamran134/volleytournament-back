import { Request, Response } from "express";
import Student, { IStudent, IStudentDetails } from "../models/student.model";
import StudentResult, { IStudentResult } from "../models/studentResult.model";

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
        const student = await Student
            .findById(req.params.id)
            .populate('school')
            .populate('teacher')
            .populate('district');

        if (!student) {
            res.status(404).json({ message: "Tələbə tapılmadı!" });
        }
        else {
            let studentWithResults;
            const studentResults: IStudentResult[] = await StudentResult.find({ student: student._id }).populate('exam');
            if (studentResults) {
                studentWithResults = {
                    ...student.toObject(),
                    results: studentResults
                }
            }
            else {
                studentWithResults = {
                    ...student.toObject(), results: []
                }
            }

            res.status(200).json(studentWithResults);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Tələbə tapılmadı!", error });
    }
}

export const deleteResult = async (req: Request, res: Response) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        res.status(200).json(student);
    }
    catch (error) {
        res.status(500).json({ message: "Tələbə silinməsində xəta!", error });
    }
}
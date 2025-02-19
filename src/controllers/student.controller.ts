import { Request, Response } from "express";
import Student, { IStudent, IStudentDetails } from "../models/student.model";
import StudentResult, { IStudentResult } from "../models/studentResult.model";
import { Types } from "mongoose";

export const getStudents = async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const size: number = parseInt(req.query.size as string) || 10;
        const skip: number = (page - 1) * size;
        const districtIds: Types.ObjectId[] = req.query.districtIds
            ? (req.query.districtIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];
        const schoolIds: Types.ObjectId[] = req.query.schoolIds
            ? (req.query.schoolIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];
        const teacherIds: Types.ObjectId[] = req.query.teacherIds
            ? (req.query.teacherIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];

        const filter: any = {};

        if (districtIds.length > 0 && schoolIds.length == 0) {
            filter.district = { $in: districtIds };
        }
        else if (schoolIds.length > 0 && teacherIds.length == 0) {
            filter.school = { $in: schoolIds };
        }
        else if (teacherIds.length > 0) {
            filter.teacher = { $in: teacherIds };
        }

        const [data, totalCount] = await Promise.all([
            Student.find(filter)
                .populate('teacher')
                .populate('school')
                .populate('district')
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

export const deleteAllStudents = async (req: Request, res: Response) => {
    try {
        const result = await Student.deleteMany();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const studentResults = await StudentResult.deleteMany({ student: req.params.id });
        const result = await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ result, studentResults });
    }
    catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}

export const deleteStudentsByIds = async (req: Request, res: Response) => {
    try {
        const { studentIds } = req.params;
        if (studentIds.length === 0) {
            res.status(400).json({ message: "Şagirdlər seçilməyib" });
            return;
        }
        const studentIdsArr = studentIds.split(",");

        const deletedStudentResults = await StudentResult.deleteMany({ student: { $in: studentIdsArr } });
        const deletedStudents = await Student.deleteMany({ _id: { $in: studentIdsArr } });

        if (deletedStudents.deletedCount === 0) {
            res.status(404).json({ message: "Silinmək üçün seçilən şagirdlər bazada tapılmadı" });
            return;
        }

        res.status(200).json({ message: `${deletedStudents.deletedCount} şagird və ${deletedStudentResults.deletedCount} onların nəticələri bazadan silindi!` });
    } catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}
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
        const grades: number[] = (req.query.grades?.toString() || '').split(',').map(grade => parseInt(grade)).filter(grade => !isNaN(grade));
        const examIds: Types.ObjectId[] = req.query.examIds
            ? (req.query.examIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];
        const defective: boolean = req.query.defective?.toString().toLowerCase() === 'true';

        const filter: any = {};

        if (defective) {
            filter.$or = [
                { teacher: null },
                { school: null },
                { district: null },
            ];
        }
        else {
            if (districtIds.length > 0 && schoolIds.length == 0) {
                filter.district = { $in: districtIds };
            }
            else if (schoolIds.length > 0 && teacherIds.length == 0) {
                filter.school = { $in: schoolIds };
            }
            else if (teacherIds.length > 0) {
                filter.teacher = { $in: teacherIds };
            }
            if (grades.length > 0) {
                filter.grade = { $in: grades }
            }
            if (examIds.length > 0) {
                const studentsInExam = (await StudentResult.find({ exam: { $in: examIds } })).map(res => res.student);
                filter._id = { $in: studentsInExam }
            }
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
        console.error(error);
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

export const searchStudents = async (req: Request, res: Response) => {
    try {
        const searchString = req.params.searchString as string || '';

        const students = await Student.aggregate([
            {
                $addFields: {
                    fullName: {
                        $concat: ['$lastName', ' ', '$firstName', ' ', '$middleName'],
                    },
                },
            },
            {
                $match: {
                    fullName: { $regex: searchString, $options: 'i' },
                },
            },
            {
                $lookup: {
                    from: 'teachers', // Название коллекции учителей
                    localField: 'teacher', // Поле в коллекции студентов
                    foreignField: '_id', // Поле в коллекции учителей
                    as: 'teacher', // Название поля для результата
                },
            },
            {
                $unwind: {
                    path: '$teacher', // Разворачиваем массив (так как $lookup возвращает массив)
                    preserveNullAndEmptyArrays: true, // Сохраняем документы, даже если teacher не найден
                },
            },
            {
                $lookup: {
                    from: 'schools', // Название коллекции школ
                    localField: 'school', // Поле в коллекции студентов
                    foreignField: '_id', // Поле в коллекции школ
                    as: 'school', // Название поля для результата
                },
            },
            {
                $unwind: {
                    path: '$school', // Разворачиваем массив
                    preserveNullAndEmptyArrays: true, // Сохраняем документы, даже если school не найдена
                },
            },
            {
                $lookup: {
                    from: 'districts', // Название коллекции районов
                    localField: 'district', // Поле в коллекции студентов
                    foreignField: '_id', // Поле в коллекции районов
                    as: 'district', // Название поля для результата
                },
            },
            {
                $unwind: {
                    path: '$district', // Разворачиваем массив
                    preserveNullAndEmptyArrays: true, // Сохраняем документы, даже если district не найден
                },
            }
        ]);

        res.status(200).json({ data: students, totalCount: students.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Axtarış zamanı xəta!" })
    }
}

export const deleteAllStudents = async (req: Request, res: Response) => {
    try {
        const result = await Student.deleteMany();
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const studentResults = await StudentResult.deleteMany({ student: req.params.id });
        const result = await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ result, studentResults });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(error);
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
        console.error(error);
        res.status(500).json(error);
    }
}
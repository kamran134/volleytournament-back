import { Request, Response } from "express";
import Student from "../models/student.model";
import StudentResult, { IStudentResult } from "../models/studentResult.model";
import { getFiltredStudents } from "../services/student.service";

export const getStudents = async (req: Request, res: Response) => {
    try {
        const { data, totalCount } = await getFiltredStudents(req);

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
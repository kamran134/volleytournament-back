import { Request, Response } from "express";
import Student from "../models/student.model";
import District from "../models/district.model";
import School from "../models/school.model";
import Teacher from "../models/teacher.model";
import StudentResult, { IStudentResult } from "../models/studentResult.model";
import { deleteStudentsByIds, getFiltredStudents } from "../services/student.service";
import { deleteStudentResultsByStudentId } from "../services/studentResult.service";

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
            .populate('district school teacher');

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

export const getStudentsForStats = async (req: Request, res: Response) => {
    try {
        const { data, totalCount } = await getFiltredStudents(req);
        const returnData = [];
        for (const student of data) {
            const studentResult = await StudentResult.find({ student: student._id });
            const score = studentResult.reduce((a, b) => a + b.score, 0);
            const studentData = {...student.toObject(), score, averageScore: score / (student.district?.rate || 1) }
            returnData.push(studentData);
        }

        res.status(200).json({ data: returnData, totalCount });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Tələbələrin alınmasında xəta", error });
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

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const studentResults = await deleteStudentResultsByStudentId(req.params.id as string);
        const result = await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ result, studentResults });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}

export const deleteStudents = async (req: Request, res: Response) => {
    try {
        const { studentIds } = req.params;
        if (studentIds.length === 0) {
            res.status(400).json({ message: "Şagirdlər seçilməyib" });
            return;
        }
        const studentIdsArr = studentIds.split(",");
        const { result, studentResults } = await deleteStudentsByIds(studentIdsArr);

        if (result && result.deletedCount === 0) {
            res.status(404).json({ message: "Silinmək üçün seçilən şagirdlər bazada tapılmadı" });
            return;
        }

        res.status(200).json({ message: `${result.deletedCount} şagird və ${studentResults.deletedCount} onların nəticələri bazadan silindi!` });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}

export const deleteAllStudents = async (req: Request, res: Response) => {
    try {
        const studentResult = await StudentResult.deleteMany();
        const result = await Student.deleteMany();
        res.status(200).json({ message: `${result.deletedCount} şagird və ${studentResult.deletedCount} onların nəticələri bazadan silindi!` });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}

export const repairStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find().populate('district school teacher');

        const studentsWithoutDistrict: string[] = [];
        const studentsWithoutSchool: string[] = [];
        const studentsWithoutTeacher: string[] = [];
        const repairedStudents: string[] = [];

        for (let student of students) {
            const studentCode: string = student.code.toString();
            if (studentCode.length !== 10) continue;

            let isUpdated = false;

            if (!student.district) {
                const districtCode = studentCode.substring(0, 3);
                const district = await District.findOne({ code: districtCode });

                if (district) {
                    student.district = district;
                    isUpdated = true;
                } else {
                    studentsWithoutDistrict.push(student.code.toString());
                }
            }

            if (!student.school) {
                const schoolCode = studentCode.substring(0, 5);
                const school = await School.findOne({ code: schoolCode });

                if (school) {
                    student.school = school;
                    isUpdated = true;
                } else {
                    studentsWithoutSchool.push(student.code.toString());
                }
            }

            if (!student.teacher) {
                const teacherCode = studentCode.substring(0, 7);
                const teacher = await Teacher.findOne({ code: teacherCode });

                if (teacher) {
                    student.teacher = teacher;
                    isUpdated = true;
                } else {
                    studentsWithoutTeacher.push(student.code.toString());
                }
            }

            if (isUpdated) {
                await student.save();
                repairedStudents.push(student.code.toString());
            }
        }

        res.status(200).json({
            message: "Tələbə məlumatları yeniləndi",
            repairedStudents,
            studentsWithoutDistrict,
            studentsWithoutSchool,
            studentsWithoutTeacher
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Tələbələrin alınmasında xəta", error });
    }
}
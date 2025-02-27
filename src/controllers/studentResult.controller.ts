import { Request, Response } from "express";
import Student, { IStudentInput } from "../models/student.model";
import StudentResult, { IStudentResultFileInput, IStudentResultInput } from "../models/studentResult.model";
import { Types } from "mongoose";
import { deleteFile } from "../services/file.service";
import { processStudentResults } from "../services/studentResult.service";
import { readExcel } from "../services/excel.service";

export const getStudentResults = async (req: Request, res: Response) => {
    try {
        const results = await StudentResult.find().populate("student").populate("exam");
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Şagird nəticələri tapılmadı!", error });
    }
}

export const createAllResults = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "Fayl yüklənməyib!" });
            return;
        }

        const { examId } = req.body;
        if (!examId) {
            res.status(400).json({ message: "İmtahan seçilməyib!" });
            return;
        }

        const rows: any[] = readExcel(req.file.path);

        if (rows.length < 2) {
            res.status(400).json({ message: "Faylda kifayət qədər sətr yoxdur!" });
            return;
        }

        const resultReadedData: IStudentResultFileInput[] = rows.slice(3).map(row => ({
            examId: new Types.ObjectId(examId),
            grade: Number(row[2]),
            studentCode: Number(row[3]),
            lastName: String(row[4]),
            firstName: String(row[5]),
            middleName: String(row[6]),
            az: Number(row[7]),
            math: Number(row[8]),
            lifeKnowledge: Number(row[9]),
            logic: Number(row[10]),
            totalScore: Number(row[11]),
            level: String(row[12])
        }));

        const studentDataToInsert: IStudentInput[] = rows.slice(3).map(row => ({
            code: Number(row[3]),
            lastName: String(row[4]),
            firstName: String(row[5]),
            middleName: String(row[6]),
            grade: Number(row[2]),
        }));

        const correctStudentDataToInsert = studentDataToInsert.filter(data => data.code > 999999999);
        const incorrectStudentCodes = studentDataToInsert.filter(data => data.code <= 999999999).map(data => data.code);

        const {students, studentsWithoutTeacher} = await processStudentResults(correctStudentDataToInsert);

        // нужны только те студенты, которые есть в базе
        const filtredResults = resultReadedData.filter(result => students.map(student => student.code).includes(result.studentCode));

        const resultsToInsert: IStudentResultInput[] = filtredResults.map(result => ({
            student: students.find(student => student.code === result.studentCode)!._id as Types.ObjectId,
            exam: result.examId as Types.ObjectId,
            grade: result.grade,
            disciplines: {
                az: Number(result.az) || 0,
                math: Number(result.math) || 0,
                lifeKnowledge: Number(result.lifeKnowledge) || 0,
                logic: Number(result.logic) || 0
            },
            totalScore: result.totalScore,
            level: result.level,
            score: 1
        }));

        // Remove the uploaded file
        deleteFile(req.file.path);

        const results = await StudentResult.insertMany(resultsToInsert);

        res.status(201).json({
            message: "Şagirdin nəticələri uğurla yaradıldı!",
            results,
            studentsWithoutTeacher,
            incorrectStudentCodes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Şagirdlərin nəticələrinin yaradılmasında xəta!", error });
    }
}

export const deleteResults = async (req: Request, res: Response) => {
    try {
        const { examId } = req.params;
        if (!examId) {
            res.status(400).json({ message: "İmtahan seçilməyib!" });
        }

        const objectId = new Types.ObjectId(examId);

        // Шаг 1: Найти всех студентов, у которых есть результаты по этому экзамену
        const studentResults = await StudentResult.find({ exam: objectId }).select("student");
        const studentIds = studentResults.map(result => result.student);

        // Шаг 2: Удалить результаты экзамена
        const deletedResults = await StudentResult.deleteMany({ exam: objectId });

        if (deletedResults.deletedCount === 0) {
            res.status(404).json({ message: "Bu imtahan üçün nəticələr tapılmadı!" });
        }

        // Шаг 3: Очистить поле `status` у найденных студентов
        if (studentIds.length > 0) {
            await Student.updateMany(
                { _id: { $in: studentIds } }, // Найти всех студентов по их _id
                { $unset: { status: "" } } // Удалить поле `status`
            );
        }

        res.status(200).json({ 
            message: "İmtahan nəticələri uğurla silindi!", 
            totalCount: deletedResults.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ message: "İmtahan nəticələrini silərkən xəta baş verdi!", error });
    }
};
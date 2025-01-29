import { Request, Response } from "express";
import xlsx from "xlsx";
import Student, { IStudent, IStudentInput } from "../models/student.model";
import StudentResult, { IStudentResultFileInput, IStudentResultInput } from "../models/studentResult.model";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";

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

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length < 2) {
            res.status(400).json({ message: "Faylda kifayət qədər sətr yoxdur!" });
            return;
        }

        const resultReadedData: IStudentResultFileInput[] = rows.slice(1).map(row => ({
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

        const studentDataToInsert: IStudentInput[] = rows.slice(1).map(row => ({
            code: Number(row[3]),
            lastName: String(row[4]),
            firstName: String(row[5]),
            middleName: String(row[6]),
            grade: Number(row[2])
        }));

        const students = await processStudentResults(studentDataToInsert);

        const resultsToInsert: IStudentResultInput[] = resultReadedData.map(result => ({
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
            level: result.level
        }));

        // Remove the uploaded file
        const filePath = path.join(__dirname, `../../${req.file.path}`);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Ошибка при удалении файла: ${err.message}`);
            } else {
                console.log(`Файл ${filePath} успешно удалён.`);
            }
        });

        const results = await StudentResult.insertMany(resultsToInsert);
        res.status(201).json({ message: "Şagirdin nəticələri uğurla yaradıldı!", results });
    } catch (error) {
        res.status(500).json({ message: "Şagirdlərin nəticələrinin yaradılmasında xəta!", error });
    }
}

export const processStudentResults = async (studentDataToInsert: IStudentInput[]): Promise<IStudent[]> => {
    try {
        const studentCodes = studentDataToInsert.map(item => item.code);
        const existingStudents = await Student.find({ code: { $in: studentCodes } });
        const newStudents = studentDataToInsert.filter(student => !existingStudents.map(d => d.code).includes(student.code));
        const newStudentsIds = await Student.insertMany(newStudents);
        const allStudents: IStudent[] = existingStudents.concat(newStudentsIds);
        return allStudents;
    } catch (error) {
        throw error;
    }
}
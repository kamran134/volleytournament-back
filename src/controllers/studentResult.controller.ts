import { Request, Response } from "express";
import xlsx from "xlsx";
import Student, { IStudent, IStudentInput } from "../models/student.model";
import Teacher, { ITeacher } from "../models/teacher.model";
import School, { ISchool } from "../models/school.model";
import District, { IDistrict } from "../models/district.model";
import StudentResult, { IStudentResultFileInput, IStudentResultInput } from "../models/studentResult.model";
import { Error, Types } from "mongoose";
import fs from "fs";
import path from "path";
import { updateStatistics, updateStatisticsByRepublic, updateStats, updateStatsByRepublic } from "./stat.controller";

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
            grade: Number(row[2]),
        }));

        const {students, studentsWithoutTeacher} = await processStudentResults(studentDataToInsert);

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
        const filePath = path.join(__dirname, `../../${req.file.path}`);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Fayl silinən zamanı xəta baş verdi: ${err.message}`);
            } else {
                console.log(`Fayl ${filePath} uğurla silindi.`);
            }
        });

        const results = await StudentResult.insertMany(resultsToInsert);

        const updateStatsStatus = await updateStats();
        const updateStatsByRepublicStatus = await updateStatsByRepublic();

        res.status(201).json({ message: "Şagirdin nəticələri uğurla yaradıldı!", results, studentsWithoutTeacher });
    } catch (error) {
        res.status(500).json({ message: "Şagirdlərin nəticələrinin yaradılmasında xəta!", error });
    }
}

export const processStudentResults = async (studentDataToInsert: IStudentInput[]): 
    Promise<{students: IStudent[], studentsWithoutTeacher: IStudentInput[]}> => {
    try {
        const studentCodes: number[] = studentDataToInsert.map(item => item.code);
        const existingStudents: IStudent[] = await Student.find({ code: { $in: studentCodes } });
        const newStudents = studentDataToInsert.filter(student => !existingStudents.map(d => d.code).includes(student.code));

        // Assign teacher to student
        await Promise.all(newStudents.map(async (student) => {
            await assignTeacherToStudent(student);
        }));

        const studentsWithTeacher: IStudentInput[] = newStudents.filter(student => student.teacher);
        const studentsWithoutTeacher: IStudentInput[] = newStudents.filter(student => !student.teacher);
        
        const newStudentsIds = await Student.insertMany(studentsWithTeacher);
        const allStudents: IStudent[] = existingStudents.concat(newStudentsIds);
        return {students: allStudents, studentsWithoutTeacher};
    } catch (error) {
        throw error;
    }
}

const assignTeacherToStudent = async (student: IStudentInput) => {
    try {
        const teacher = await Teacher.findOne({ code: Math.floor(student.code / 1000) }) as ITeacher;
        if (teacher) {
            student.teacher = teacher._id as Types.ObjectId;
            const studentSchool = await School.findById(teacher.school);
            if (studentSchool) {
                student.school = studentSchool._id as Types.ObjectId;
                const studentDistrict = await District.findById(studentSchool.district);
                if (studentDistrict) {
                    student.district = studentDistrict._id as Types.ObjectId;
                }
            }
        } else {
            console.log(`Uğursuz: ${student.code}`);
        }
    } catch (error) {
        console.error(`Xəta: ${error}`);
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
            deletedCount: deletedResults.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ message: "İmtahan nəticələrini silərkən xəta baş verdi!", error });
    }
};
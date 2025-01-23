import { Request, Response } from "express";
import xlsx from "xlsx";
import Student, { IStudentInput } from "../models/student.model";
import StudentResult, { IStudentResultInput } from "../models/studentResult.model";
import { Types } from "mongoose";

export const createAllResults = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "Fayl yüklənməyib!" });
            return;
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length < 2) {
            console.warn('Not enough rows');
            res.status(400).json({ message: "Faylda kifayət qədər sətr yoxdur!" });
            return;
        }

        const studentDataToInsert: IStudentInput[] = rows.slice(1).map(row => ({
            code: Number(row[3]),
            lastName: String(row[4]),
            firstName: String(row[5]),
            middleName: String(row[6]),
            grade: Number(row[2])
        }));

        // получаем коды студентов
        const importedStudentCodes = studentDataToInsert.filter(item => item.code > 0).map(item => item.code);
        // получаем список тех, кто уже есть
        const existingStudents = await Student.find({ code: { $in: importedStudentCodes } });
        // понимаем какие уже есть в базе, а каких нет
        const existingStudentCodes = existingStudents.map(d => d.code);
        const missingStudentCodes = importedStudentCodes.filter(code => !existingStudentCodes.includes(code!));
        const missingStudents = studentDataToInsert.filter(student => !existingStudentCodes.includes(student.code));

        /*
        if (missingStudents.length > 0) {
            const result = await Student.collection.bulkWrite(missingStudents)
        }
        // const resultDataToInsert: IStudentResultInput[] = rows.slice(1).map(row => {
        //    exam 
        // });

        const schoolCodes = dataToInsert.filter(item => item.schoolCode > 0).map(item => item.schoolCode);
        const existingSchools = await School.find({ code: { $in: schoolCodes } });
        const existingSchoolCodes = existingSchools.map(d => d.code);
        const missingSchoolCodes = schoolCodes.filter(code => !existingSchoolCodes.includes(code));

        const schoolMap = existingSchools.reduce((map, school) => {
            map[school.code] = String(school._id);
            return map;
        }, {} as Record<string, string>);

        const teachersToSave = dataToInsert.filter(item => item.code > 0 && item.schoolCode > 0).map(item => ({
            school: schoolMap[item.schoolCode],
            code: item.code,
            fullname: item.fullname
        }));

        const results = await Teacher.collection.bulkWrite(
            teachersToSave.map(teacher => ({
                updateOne: {
                    filter: { code: teacher.code }, 
                    update: { $set: teacher }, 
                    upsert: true 
                }
            }))
        );

        const numCreated = results.upsertedCount;
        const numUpdated = results.modifiedCount;
        res.status(201).json({ message: "Fayl uğurla yükləndi!", details: `Yeni müəllimlər: ${numCreated}\nYenilənən müəllimlər: ${numUpdated}` });
        */
    } catch (error) {
        res.status(500).json({ message: "Müəllimlərin yaradılmasında xəta!", error });
    }
}

// export const 
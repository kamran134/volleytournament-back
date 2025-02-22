import { Request, Response } from "express";
import Teacher, { ITeacherInput } from "../models/teacher.model";
import School from "../models/school.model";
import { Types } from "mongoose";
import { readExcel } from "../services/excel.service";
import { checkExistingTeacherCodes } from "../services/teacher.service";
import { checkExistingSchools } from "../services/school.service";
import { deleteFile } from "../services/file.service";

export const getTeachers = async (req: Request, res: Response) => {
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

        const filter: any = {};

        if (districtIds.length > 0 && schoolIds.length == 0) {
            const districtSchoolIds = await School.find({ district: { $in: districtIds } }).select("_id");
            filter.school = { $in: districtSchoolIds.map(s => s._id) };
        }
        else if (schoolIds.length > 0) {
            filter.school = { $in: schoolIds };
        }
        
        const [data, totalCount] = await Promise.all([
            Teacher.find(filter)
                .populate({
                    path: 'school',
                    populate: { path: 'district' }
                })
                .skip(skip)
                .limit(size),
            Teacher.countDocuments(filter)
        ]);
        
        res.status(200).json({ data, totalCount });
    } catch (error) {
        res.status(500).json({ message: "Müəllimlərin alınmasında xəta!", error });
    }
}

export const getTeachersForFilter = async (req: Request, res: Response) => {
    try {
        const schoolIds: Types.ObjectId[] = req.query.schoolIds
            ? (req.query.schoolIds as string).split(',').map(id => new Types.ObjectId(id.trim()))
            : [];
        
        const filter: any = {};

        if (schoolIds.length > 0) {
            filter.school = { $in: schoolIds };
        }

        const [data, totalCount] = await Promise.all([
            Teacher.find(filter)
                .populate('school')
                .sort({ code: 1 }),
            Teacher.countDocuments(filter)
        ]);

        res.status(200).json({ data, totalCount });
    } catch (error) {
        res.status(500).json({ message: "Müəllimlərin alınmasında xəta", error });
    }
};

export const createTeacher = async (req: Request, res: Response) => {
    try {
        const { fullname, code, schoolCode } = req.body;

        const existingSchool = await School.findOne({ code: schoolCode });
        if (!existingSchool) {
            res.status(400).json({ message: "Bu kodda məktəb tapılmadı" });
            return;
        }

        const teacher = new Teacher({
            fullname,
            code,
            school: existingSchool._id
        });

        const savedTeacher = await teacher.save();
        res.status(201).json(savedTeacher);
    } catch (error) {
        res.status(500).json({ message: "Müəllimin əlavə edilməsində xəta", error })
    }
}

export const createAllTeachers = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "Fayl yüklənməyib!" });
            return;
        }

        const rows: any[] = readExcel(req.file.path);

        if (rows.length < 5) {
            console.warn('Not enough rows');
            res.status(400).json({ message: "Faylda kifayət qədər sətr yoxdur!" });
            return;
        }

        const dataToInsert: ITeacherInput[] = rows.slice(4).map(row => ({
            schoolCode: Number(row[2]) || 0,
            code: Number(row[3]),
            fullname: String(row[4])
        }));

        // Выявляем и отсеиваем некорректных учителей
        const correctTeachersToInsert = dataToInsert.filter(data => data.code > 999999);
        const incorrectTeacherCodes = dataToInsert.filter(data => data.code <= 999999).map(data => data.code);

        // Сначала отсеиваем учителей, которые уже есть
        const existingTeacherCodes: number[] = await checkExistingTeacherCodes(correctTeachersToInsert.map(data => data.code));
        const newTeachers: ITeacherInput[] = correctTeachersToInsert.filter(data => !existingTeacherCodes.includes(data.code));

        const schoolCodes = newTeachers.filter(item => item.schoolCode > 0).map(item => item.schoolCode);
        const teacherCodesWithoutSchoolCodes = newTeachers.filter(item => item.schoolCode === 0).map(item => item.code);
        
        // Проверяем все ли указанные школы существуют у нас в базе
        const existingSchools = await checkExistingSchools(schoolCodes);
        const existingSchoolCodes = existingSchools.map(d => d.code);
        const missingSchoolCodes = schoolCodes.filter(code => !existingSchoolCodes.includes(code));

        const schoolMap = existingSchools.reduce((map, school) => {
            map[school.code] = String(school._id);
            return map;
        }, {} as Record<string, string>);

        const teachersToSave = newTeachers.filter(
            item =>
                item.code > 0 && 
                !missingSchoolCodes.includes(item.schoolCode) &&
                !teacherCodesWithoutSchoolCodes.includes(item.code)
            ).map(
                item => ({
                    school: schoolMap[item.schoolCode],
                    code: item.code,
                    fullname: item.fullname
        }));

        // Remove the uploaded file
        deleteFile(req.file.path);

        if (teachersToSave.length === 0) {
            res.status(201).json({
                message: "Bütün müəllimlər bazada var!",
                missingSchoolCodes,
                teacherCodesWithoutSchoolCodes,
                incorrectTeacherCodes
            });
            return;
        }

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

        res.status(201).json({
            message: "Fayl uğurla yükləndi!",
            details: `Yeni müəllimlər: ${numCreated}\nYenilənən müəllimlər: ${numUpdated}`,
            missingSchoolCodes,
            teacherCodesWithoutSchoolCodes
        });
    } catch (error) {
        res.status(500).json({ message: "Müəllimlərin yaradılmasında xəta!", error });
    }
}

export const deleteTeacher = async (req: Request, res: Response) => {
    try {
        const result = await Teacher.findByIdAndDelete(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}

export const deleteTeachersByIds = async (req: Request, res: Response) => {
    try {
        const { teacherIds } = req.params;
        if (teacherIds.length === 0) {
            res.status(400).json({ message: "Müəllimlər seçilməyib" });
            return;
        }
        const teacherIdsArr = teacherIds.split(",");

        const deletedStudents = await Teacher.deleteMany({ _id: { $in: teacherIdsArr } });

        if (deletedStudents.deletedCount === 0) {
            res.status(404).json({ message: "Silinmək üçün seçilən müəllimlər bazada tapılmadı" });
            return;
        }

        res.status(200).json({ message: `${deletedStudents.deletedCount} müəllim bazadan silindi!` });
    } catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}
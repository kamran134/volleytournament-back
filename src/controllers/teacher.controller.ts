import { Request, Response } from "express";
import Teacher, { ITeacherInput } from "../models/teacher.model";
import School from "../models/school.model";
import District from "../models/district.model";
import { Types } from "mongoose";
import { readExcel } from "../services/excel.service";
import { checkExistingTeacherCodes, deleteTeacherById, deleteTeachersByIds, getFiltredTeachers } from "../services/teacher.service";
import { checkExistingSchools } from "../services/school.service";
import { deleteFile } from "../services/file.service";
import { checkExistingDistricts } from "../services/district.service";

export const getTeachers = async (req: Request, res: Response) => {
    try {
        const { data, totalCount } = await getFiltredTeachers(req);
        
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
            res.status(400).json({ message: "Faylda kifayət qədər sətr yoxdur!" });
            return;
        }

        const dataToInsert: ITeacherInput[] = rows.slice(4).map(row => ({
            districtCode: Number(row[1]) || 0,
            schoolCode: Number(row[2]) || 0,
            code: Number(row[3]),
            fullname: String(row[4])
        }));

        // Выявляем и отсеиваем некорректных учителей
        const correctTeachersToInsert = dataToInsert.filter(data => data.code > 999999);
        const incorrectTeacherCodes = dataToInsert.filter(data => data.code <= 999999).map(data => data.code);

        // Сначала отсеиваем учителей, которые уже есть
        const existingTeacherCodes: number[] = await checkExistingTeacherCodes(correctTeachersToInsert.map(data => data.code));
        
        const newTeachers: ITeacherInput[] = existingTeacherCodes.length > 0
            ? correctTeachersToInsert.filter(data => !existingTeacherCodes.includes(data.code))
            : correctTeachersToInsert;

        const districtCodes = newTeachers.filter(item => item.districtCode > 0).map(item => item.districtCode);
        const schoolCodes = newTeachers.filter(item => item.schoolCode > 0).map(item => item.schoolCode);
        const teacherCodesWithoutSchoolCodes = newTeachers.filter(item => item.schoolCode === 0).map(item => item.code);
        
        // Проверяем все ли указанные районы и школы существуют у нас в базе
        const existingDistricts = await checkExistingDistricts(districtCodes);
        const existingDistrictCodes = existingDistricts.map(d => d.code);
        const missingDistrictCodes = districtCodes.filter(code => !existingDistrictCodes.includes(code));

        const existingSchools = await checkExistingSchools(schoolCodes);
        const existingSchoolCodes = existingSchools.map(s => s.code);
        const missingSchoolCodes = schoolCodes.filter(code => !existingSchoolCodes.includes(code));

        const schoolMap = existingSchools.reduce((map, school) => {
            map[school.code] = school._id as Types.ObjectId;
            return map;
        }, {} as Record<string, Types.ObjectId>);

        const districtMap = existingDistricts.reduce((map, district) => {
            map[district.code] = district._id as Types.ObjectId;
            return map;
        }, {} as Record<string, Types.ObjectId>);

        const teachersToSave = newTeachers.filter(
            item =>
                item.code > 0 &&
                !missingDistrictCodes.includes(item.districtCode) &&
                !missingSchoolCodes.includes(item.schoolCode) &&
                !teacherCodesWithoutSchoolCodes.includes(item.code)
            ).map(
                item => ({
                    district: districtMap[item.districtCode],
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
        const teacherId = req.params.id;
        const result = await deleteTeacherById(teacherId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}

export const deleteTeachers = async (req: Request, res: Response) => {
    try {
        const { teacherIds } = req.params;
        if (teacherIds.length === 0) {
            res.status(400).json({ message: "Müəllimlər seçilməyib" });
            return;
        }
        const teacherIdsArr = teacherIds.split(",");

        const result = await deleteTeachersByIds(teacherIdsArr);
        
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Silinmək üçün seçilən müəllimlər bazada tapılmadı" });
            return;
        }

        res.status(200).json({ message: `${result.deletedCount} müəllim bazadan silindi!` });
    } catch (error) {
        res.status(500).json(error);
        console.error(error);
    }
}

export const repairTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await Teacher.find().populate('district school');

        const teachersWithoutDistrict: string[] = [];
        const teachersWithoutSchool: string[] = [];
        const repairedTeachers: string[] = [];

        for (let teacher of teachers) {
            const teacherCode: string = teacher.code.toString();
            if (teacherCode.length !== 7) continue;

            let isUpdated = false;

            if (!teacher.district) {
                const districtCode = teacherCode.substring(0, 3);
                const district = await District.findOne({ code: districtCode });

                if (district) {
                    teacher.district = district;
                    isUpdated = true;
                } else {
                    teachersWithoutDistrict.push(teacher.code.toString());
                }
            }

            if (!teacher.school) {
                const schoolCode = teacherCode.substring(0, 5);
                const school = await School.findOne({ code: schoolCode });

                if (school) {
                    teacher.school = school;
                    isUpdated = true;
                } else {
                    teachersWithoutSchool.push(teacher.code.toString());
                }
            }

            if (isUpdated) {
                await teacher.save();
                repairedTeachers.push(teacher.code.toString());
            }
        }

        res.status(200).json({
            message: "Müəllimlərin məlumatları yeniləndi",
            repairedTeachers,
            teachersWithoutDistrict,
            teachersWithoutSchool
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Müəllimlərin alınmasında xəta", error });
    }
}
import { Request, Response } from "express";
import xlsx from "xlsx";
import Teacher, { ITeacherInput } from "../models/teacher.model";
import School from "../models/school.model";
import { Types } from "mongoose";

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

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length < 5) {
            console.warn('Not enough rows');
            res.status(400).json({ message: "Faylda kifayət qədər sətr yoxdur!" });
            return;
        }

        const dataToInsert: ITeacherInput[] = rows.slice(4).map(row => ({
            schoolCode: Number(row[2]),
            code: Number(row[3]),
            fullname: String(row[4])
        }));

        const schoolCodes = dataToInsert.filter(item => item.schoolCode > 0).map(item => item.schoolCode);
        const existingSchools = await School.find({ code: { $in: schoolCodes } });
        const existingSchoolCodes = existingSchools.map(d => d.code);
        const missingSchoolCodes = schoolCodes.filter(code => !existingSchoolCodes.includes(code));

        // if (missingSchoolCodes.length > 0) {
        //     console.error('missing codes: ', JSON.stringify(missingSchoolCodes));
        //     res.status(400).json({
        //         message: "Bəzi məktəb kodları tapılmadı!",
        //         missingSchoolCodes
        //     });
        //     return;
        // }

        const schoolMap = existingSchools.reduce((map, school) => {
            map[school.code] = String(school._id);
            return map;
        }, {} as Record<string, string>);

        const teachersToSave = dataToInsert.filter(item => item.code > 0 && item.schoolCode > 0).map(item => ({
            school: schoolMap[item.schoolCode],
            code: item.code,
            fullname: item.fullname
        }));

        // const savedTeachers = await Teacher.insertMany(teachersToSave);
        // res.status(201).json({ message: "Fayl uğurla yükləndi!", savedTeachers });
        const results = await Teacher.collection.bulkWrite(
            teachersToSave.map(teacher => ({
                updateOne: {
                    filter: { code: teacher.code }, 
                    update: { $set: teacher }, 
                    upsert: true 
                }
            }))
        );
      
        // Analyze results for success and failures
        const numCreated = results.upsertedCount;
        const numUpdated = results.modifiedCount;
        res.status(201).json({ message: "Fayl uğurla yükləndi!", details: `Yeni müəllimlər: ${numCreated}\nYenilənən müəllimlər: ${numUpdated}` });

    } catch (error) {
        res.status(500).json({ message: "Müəllimlərin yaradılmasında xəta!", error });
    }
}
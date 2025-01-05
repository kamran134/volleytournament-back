import { Request, Response } from "express";
import xlsx from "xlsx";
import School, { ISchoolInput } from "../models/school.model";
import District from "../models/district.model";
import mongoose from "mongoose";

export const getSchools = async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const size: number = parseInt(req.query.size as string) || 10;
        const skip: number = (page - 1) * size;
        const districtIds: string[] = req.query.districtIds
            ? (req.query.districtIds as string).split(',')
            : [];

        const filter: any = {};

        if (districtIds.length > 0) {
            filter.district = { $in: districtIds };
        }

        const [data, totalCount] = await Promise.all([
            School.find(filter)
                .populate('district')
                .sort({ code: 1 })
                .skip(skip)
                .limit(size),
            School.countDocuments(filter)
        ]);

        res.status(200).json({ data, totalCount });
    } catch (error) {
        res.status(500).json({ message: "Məktəblərin alınmasında xəta", error });
    }
};

export const getSchoolsForFilter = async (req: Request, res: Response) => {
    try {
        const districtIds: mongoose.Types.ObjectId[] = req.query.districtIds
            ? (req.query.districtIds as string).split(',').map(id => new mongoose.Types.ObjectId(id.trim()))
            : [];
        
        const filter: any = {};

        if (districtIds.length > 0) {
            filter.district = { $in: districtIds };
        }
        
        const [data, totalCount] = await Promise.all([
            School.find(filter)
                .populate('district')
                .sort({ code: 1 }),
            School.countDocuments(filter)
        ]);

        res.status(200).json({ data, totalCount });
    } catch (error) {
        res.status(500).json({ message: "Məktəblərin alınmasında xəta", error });
    }
};

export const createSchool = async (req: Request, res: Response) => {
    try {
        const { name, address, code, districtCode } = req.body;
  
        const existingDistrict = await District.findOne({ code: districtCode });
        if (!existingDistrict) {
            res.status(400).json({ message: "Bu kodda rayon tapılmadı" });
            return;
        }
  
        const school = new School({
            name,
            address,
            code,
            district: existingDistrict._id,
        });
  
        const savedSchool = await school.save();
        res.status(201).json(savedSchool);
    } catch (error) {
        res.status(500).json({ message: "Məktəbin yaradılmasında xəta", error });
    }
};

export const createAllSchools = async (req: Request, res: Response) => {
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

        const dataToInsert: ISchoolInput[] = rows.slice(4).map(row => ({
            districtCode: Number(row[1]),
            code: Number(row[2]),
            name: String(row[3]),
            address: ''
        }));

        const districtCodes = dataToInsert.filter(item => item.districtCode > 0).map(item => item.districtCode);
        const existingDistricts = await District.find({ code: { $in: districtCodes } });
        const existingDistrictCodes = existingDistricts.map(d => d.code);
        const missingDistrictCodes = districtCodes.filter(code => !existingDistrictCodes.includes(code!));

        if (missingDistrictCodes.length > 0) {
            console.error('missing codes: ', JSON.stringify(missingDistrictCodes));
            res.status(400).json({
                message: "Bəzi rayon kodları tapılmadı!",
                missingDistrictCodes
            });
            return;
        }

        const districtMap = existingDistricts.reduce((map, district) => {
            map[district.code] = String(district._id);
            return map;
        }, {} as Record<string, string>);

        const schoolsToSave = dataToInsert.filter(item => item.code > 0 && item.districtCode > 0).map(item => ({
            name: item.name,
            address: item.address,
            code: item.code,
            districtCode: item.districtCode,
            district: districtMap[item.districtCode]
        }));

        // const savedSchools = await School.insertMany(schoolsToSave);
        
        // res.status(201).json({ message: "Fayl uğurla yükləndi!", savedSchools });
        const results = await School.collection.bulkWrite(
            schoolsToSave.map(school => ({
                updateOne: {
                    filter: { code: school.code }, 
                    update: { $set: school }, 
                    upsert: true 
                }
            }))
        );
      
        // Analyze results for success and failures
        const numCreated = results.upsertedCount;
        const numUpdated = results.modifiedCount;
        res.status(201).json({ message: "Fayl uğurla yükləndi!", details: `Yeni məktəblər: ${numCreated}\nYenilənən məktəblər: ${numUpdated}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Məktəblərin yaradılmasında xəta", error })
    }
}
import { Request } from "express";
import Teacher, { ITeacher } from "../models/teacher.model";
import School from "../models/school.model";
import { Types } from "mongoose";

export const checkExistingTeachers = async (codes: number[]): Promise<ITeacher[]> => {
    try {
        const result = await Teacher.find({ code: { $in: codes } });
        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Не удалось осуществить поиск!");
    }
}

export const checkExistingTeacherCodes = async (codes: number[]): Promise<number[]> => {
    try {
        // Используем .distinct() для получения массива уникальных кодов
        const existingCodes = await Teacher.distinct("code", { code: { $in: codes } });
        return existingCodes;
    } catch (error) {
        console.error("Ошибка при поиске:", error);
        throw new Error("Не удалось осуществить поиск!");
    }
};

export const getFiltredTeachers = async (req: Request): Promise<{ data: ITeacher[], totalCount: number }> => {
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
            
            return { data, totalCount };
        } catch (error) {
            throw error;
        }
    }
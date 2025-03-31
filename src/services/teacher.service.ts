import { Request } from "express";
import Teacher, { ITeacher } from "../models/teacher.model";
import { DeleteResult, Types } from "mongoose";
import { deleteStudentsByTeacherId, deleteStudentsByTeachersIds } from "./student.service";

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
            const sortColumn: string = req.query.sortColumn?.toString() || 'averageScore';
            const sortDirection: string = req.query.sortDirection?.toString() || 'desc';
    
            const filter: any = {};

            if (districtIds.length > 0 && schoolIds.length == 0) {
                filter.district = { $in: districtIds }
            }
            if (schoolIds.length > 0) {
                filter.school = { $in: schoolIds };
            }

            const [data, totalCount] = await Promise.all([
                Teacher.find(filter)
                    .populate('district school')
                    .sort({ [sortColumn]: sortDirection === 'asc' ? 1 : -1 })
                    .skip(skip)
                    .limit(size),
                Teacher.countDocuments(filter)
            ]);
            
            return { data, totalCount };
        } catch (error) {
            throw error;
        }
}

export const deleteTeacherById = async (id: string): Promise<ITeacher | null> => {
    try {
        const [deletedStudents, deletedTeacher] = await Promise.all([
            deleteStudentsByTeacherId(id),
            Teacher.findByIdAndDelete(id)
        ]);
        return deletedTeacher;
    } catch (error) {
        console.error(error);
        throw new Error("Müəllim tapılmadı!");
    }
}

export const deleteTeachersByIds = async (ids: string[]): Promise<DeleteResult> => {
    try {
        await deleteStudentsByTeachersIds(ids);
        const deletedTeachers = await Teacher.deleteMany({ _id: { $in: ids } });
        return deletedTeachers;
    } catch (error) {
        console.error(error);
        throw new Error("Müəllimlər silinə bilmədi!");
    }
}
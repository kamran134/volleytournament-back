import { DeleteResult } from "mongoose";
import School, { ISchool } from "../models/school.model";
import Teacher from "../models/teacher.model";
import Student from "../models/student.model";
import StudentResult from "../models/studentResult.model";

export const checkExistingSchools = async (codes: number[]): Promise<ISchool[]> => {
    try {
        const result = await School.find({ code: { $in: codes } });
        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Не удалось осуществить поиск!");
    }
}

export const checkExistingSchoolCodes = async (codes: number[]): Promise<number[]> => {
    try {
        // Используем .distinct() для получения массива уникальных кодов
        const existingCodes = await School.distinct("code", { code: { $in: codes } });
        return existingCodes;
    } catch (error) {
        console.error("Ошибка при поиске:", error);
        throw new Error("Не удалось осуществить поиск!");
    }
};

export const deleteSchoolById = async (schoolId: string): Promise<DeleteResult> => {
    try {
        const students = await Student.find({ school: schoolId });
        const studentIds = students.map(student => student._id);
        await StudentResult.deleteMany({ student: { $in: studentIds } });
        await Student.deleteMany({ school: schoolId });
        await Teacher.deleteMany({ school: schoolId });
        const result = await School.deleteOne({ _id: schoolId });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteSchoolsByIds = async (schoolIds: string[]): Promise<DeleteResult> => {
    try {
        const students = await Student.find({ school: { $in: schoolIds } });
        const studentIds = students.map(student => student._id);
        await StudentResult.deleteMany({ student: { $in: studentIds } });
        await Student.deleteMany({ school: { $in: schoolIds } });
        await Teacher.deleteMany({ school: { $in: schoolIds } });
        const result = await School.deleteMany({ _id: { $in: schoolIds } });
        return result;
    } catch (error) {
        throw error;
    }
}
import { Types } from "mongoose";
import { IStudentInput } from "../models/student.model";
import Teacher, { ITeacher } from "../models/teacher.model";
import School from "../models/school.model";
import District from "../models/district.model";

export const assignTeacherToStudent = async (student: IStudentInput) => {
    try {
        const teacher: ITeacher | null = await Teacher.findOne({ code: Math.floor(student.code / 1000) });
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
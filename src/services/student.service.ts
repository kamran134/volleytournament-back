import { Types } from "mongoose";
import { IStudent, IStudentInput } from "../models/student.model";
import Teacher, { ITeacher } from "../models/teacher.model";
import School from "../models/school.model";
import District from "../models/district.model";
import Student from "../models/student.model";
import StudentResult from "../models/studentResult.model";
import { Request } from "express";

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

export const getFiltredStudents = async (req: Request): Promise<{ data: IStudent[], totalCount: number }> => {
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
        const teacherIds: Types.ObjectId[] = req.query.teacherIds
            ? (req.query.teacherIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];
        const grades: number[] = (req.query.grades?.toString() || '').split(',').map(grade => parseInt(grade)).filter(grade => !isNaN(grade));
        const examIds: Types.ObjectId[] = req.query.examIds
            ? (req.query.examIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];
        const defective: boolean = req.query.defective?.toString().toLowerCase() === 'true';

        const filter: any = {};

        if (defective) {
            filter.$or = [
                { teacher: null },
                { school: null },
                { district: null },
            ];
        }
        else {
            if (districtIds.length > 0 && schoolIds.length == 0) {
                filter.district = { $in: districtIds };
            }
            else if (schoolIds.length > 0 && teacherIds.length == 0) {
                filter.school = { $in: schoolIds };
            }
            else if (teacherIds.length > 0) {
                filter.teacher = { $in: teacherIds };
            }
            if (grades.length > 0) {
                filter.grade = { $in: grades }
            }
            if (examIds.length > 0) {
                const studentsInExam = (await StudentResult.find({ exam: { $in: examIds } })).map(res => res.student);
                filter._id = { $in: studentsInExam }
            }
        }

        const [data, totalCount] = await Promise.all([
            Student.find(filter)
                .populate('district school teacher')
                .sort({ code: 1 })
                .skip(skip)
                .limit(size),
            Student.countDocuments(filter)
        ]);

        return { data, totalCount };
    } catch (error) {
        throw error;
    }
}
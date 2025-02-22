import { Request, Response } from "express";
import StudentResult, { IStudentResult } from "../models/studentResult.model";
import { IStudent } from "../models/student.model";
import District from "../models/district.model";
import School from "../models/school.model";
import Teacher from "../models/teacher.model";
import Exam from "../models/exam.model";
import { updateStats } from "../services/stats.service";

export const updateStatistics = async (req: Request, res: Response) => {
    try {
        const status = await updateStats();
        if (status === 404) {
            res.status(404).json({ message: "404: Nəticələr tapılmadı!" });
            return;
        }
        res.status(200).json({ message: "Statistika yeniləndi" });
    } catch (error) {
        res.status(500).json({ message: "Statistikanın yenilənməsində xəta!", error });
    }
}

export const calculateAndSaveScores = async (req: Request, res: Response) => {
    try {
        const results = await StudentResult.find().populate('student');
        
        const districtScores = new Map<string, number>();
        const schoolScores = new Map<string, number>();
        const teacherScores = new Map<string, number>();

        for (const result of results) {
            const student = result.student as IStudent;
            if (!student) continue;

            const { district, school, teacher } = student;
            const score = result.totalScore;
            
            if (district) {
                districtScores.set(district.toString(), (districtScores.get(district.toString()) || 0) + score);
            }
            if (school) {
                schoolScores.set(school.toString(), (schoolScores.get(school.toString()) || 0) + score);
            }
            if (teacher) {
                teacherScores.set(teacher.toString(), (teacherScores.get(teacher.toString()) || 0) + score);
            }
        }

        // Обновление данных в базе
        for (const [districtId, score] of districtScores) {
            await District.findByIdAndUpdate(districtId, { score }, { new: true });
        }
        for (const [schoolId, score] of schoolScores) {
            await School.findByIdAndUpdate(schoolId, { score }, { new: true });
        }
        for (const [teacherId, score] of teacherScores) {
            await Teacher.findByIdAndUpdate(teacherId, { score }, { new: true });
        }

        console.log('Scores updated successfully');
    } catch (error) {
        console.error('Error updating scores:', error);
    }
}

export const getStatistics = async (req: Request, res: Response) => {
    try {
        const { month } = req.query;
        if (!month) {
            res.status(400).json({ message: "Ay seçilməyib!" });
            return;
        }

        const [year, monthStr] = (month as string).split("-");
        const monthIndex: number = parseInt(monthStr, 10);
        const selectedMonth = new Date(parseInt(year, 10), monthIndex, 1);
        const startDate = new Date(selectedMonth);
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

        const examsInMonth = await Exam.find({ date: { $gte: startDate, $lt: endDate } }).select('_id');

        const studentResults: IStudentResult[] = await StudentResult.find({exam: { $in: examsInMonth.map(e => e._id) }})
            .populate("exam")
            .populate({ path: "student", populate: [
                { path: "district", model: "District" },
                { path: "school", model: "School" },
                { path: "teacher", model: "Teacher" }
            ]});

        const studentsOfMonth: IStudentResult[] = studentResults.filter(r => r.status?.match(/Ayın şagirdi/i));
        const studentsOfMonthByRepublic: IStudentResult[] = studentResults.filter(r => r.status?.match(/Respublika üzrə ayın şagirdi/i));
        const developingStudents: IStudentResult[] = studentResults.filter(r => r.status?.match(/İnkişaf edən şagird/i));

        // const studentsOfMonth: IStudent[] = await Student.find({ status: { $regex: "Ayın şagirdi", $options: "i" } });
        // const studentsOfMonthByRepublic: IStudent[] = await Student.find({ status: { $regex: "Respublika üzrə ayın şagirdi", $options: "i" } });
        // const developingStudents: IStudent[] = await Student.find({ status: { $regex: "İnkişaf edən şagird", $options: "i" } });
        res.status(200).json({ studentsOfMonth, studentsOfMonthByRepublic, developingStudents });
    } catch (error) {
        res.status(500).json({ message: "Statistikanın alınmasında xəta", error });
    }
}
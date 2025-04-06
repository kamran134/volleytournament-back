import { Request, Response } from "express";
import StudentResult, { IStudentResult } from "../models/studentResult.model";
import Exam from "../models/exam.model";
import Teacher from "../models/teacher.model";
import School from "../models/school.model";
import District from "../models/district.model";
import { updateStats } from "../services/stats.service";
import { Types } from "mongoose";
import { getFiltredStudents } from "../services/student.service";

export const updateStatistics = async (req: Request, res: Response) => {
    try {
        const status = await updateStats();
        
        if (status === 404) {
            res.status(404).json({ message: "404: Nəticələr tapılmadı!" });
            return;
        }
        res.status(200).json({ message: "Statistika yeniləndi" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Statistikanın yenilənməsində xəta!", error });
    }
}

export const getStudentsStatistics = async (req: Request, res: Response) => {
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

        let filter: any = { exam: { $in: examsInMonth.map(e => e._id) } };

        console.log(`Start date: ${startDate}, End date: ${endDate}`);
        console.log(`Exams in month: ${examsInMonth.map(e => e._id)}`);
        console.log(`Filter: ${JSON.stringify(filter)}`);

        if (req.query.districtIds) {
            const filtredStudentsData = await getFiltredStudents(req);
            if (filtredStudentsData.totalCount > 0) {
                filter.student = { $in: filtredStudentsData.data.map(s => s._id) };
            }
            else {
                res.status(404).json({ message: "Nəticə tapılmadı!" });
                return;
            }
        }

        const studentResults: IStudentResult[] = await StudentResult.find(filter)
            .populate("exam")
            .populate({ path: "student", populate: [
                { path: "district", model: "District" },
                { path: "school", model: "School" },
                { path: "teacher", model: "Teacher" }
            ]});

        console.log(`Student results: ${studentResults.length}`);

        const studentsOfMonth: IStudentResult[] = studentResults.filter(r => r.status?.match(/Ayın şagirdi/i));
        const studentsOfMonthByRepublic: IStudentResult[] = studentResults.filter(r => r.status?.match(/Respublika üzrə ayın şagirdi/i));
        const developingStudents: IStudentResult[] = studentResults.filter(r => r.status?.match(/İnkişaf edən şagird/i));

        res.status(200).json({ studentsOfMonth, studentsOfMonthByRepublic, developingStudents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Statistikanın alınmasında xəta", error });
    }
}

export const getStatisticsByExam = async (req: Request, res: Response) => {
    try {
        const examId = req.params.examId;
        const studentResults: IStudentResult[] = await StudentResult.find({ exam: examId })
            .populate("exam")
            .populate({ path: "student", populate: [
                { path: "district", model: "District" },
                { path: "school", model: "School" },
                { path: "teacher", model: "Teacher" }
            ]});

        const studentsOfMonth: IStudentResult[] = studentResults.filter(r => r.status?.match(/Ayın şagirdi/i));
        const studentsOfMonthByRepublic: IStudentResult[] = studentResults.filter(r => r.status?.match(/Respublika üzrə ayın şagirdi/i));
        const developingStudents: IStudentResult[] = studentResults.filter(r => r.status?.match(/İnkişaf edən şagird/i));

        res.status(200).json({ studentsOfMonth, studentsOfMonthByRepublic, developingStudents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Statistikanın alınmasında xəta", error });
    }
}

export const getTeacherStatistics = async (req: Request, res: Response) => {
    try {
        const districtIds: Types.ObjectId[] = req.query.districtIds
            ? (req.query.districtIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];
        const schoolIds: Types.ObjectId[] = req.query.schoolIds
            ? (req.query.schoolIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];

        const filter: any = { score: { $exists: true }, averageScore: { $exists: true } };

        if (districtIds.length > 0) {
            filter.district = { $in: districtIds };
        }
        if (schoolIds.length > 0) {
            filter.school = { $in: schoolIds };
        }
        
        // просто берём учителей из базы, тех, у кого есть score и averageScore по убыванию averageScore
        const teachers = await Teacher
            .find(filter)
            .populate("school")
            .populate({ path: "school", populate: { path: "district", model: "District" } })
            .sort({ averageScore: -1 });

        res.status(200).json({ teachers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Müəllimlərin statistikasının alınmasında xəta", error });
    }
}

export const getSchoolStatistics = async (req: Request, res: Response) => {
    try {
        // просто берём школы из базы, тех, у кого есть score и averageScore по убыванию averageScore
        const districtIds: Types.ObjectId[] = req.query.districtIds
            ? (req.query.districtIds as string).split(',').map(id => new Types.ObjectId(id))
            : [];

        const filter: any = { score: { $exists: true }, averageScore: { $exists: true } };

        if (districtIds.length > 0) {
            filter.district = { $in: districtIds };
        }

        const schools = await School
            .find(filter)
            .populate("district")
            .sort({ averageScore: -1 });

        res.status(200).json({ schools });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Məktəblərin statistikasının alınmasında xəta", error });
    }
}

export const getDistrictStatistics = async (req: Request, res: Response) => {
    try {
        // просто берём районы из базы, тех, у кого есть score и averageScore по убыванию averageScore
        const districts = await District
            .find({ score: { $exists: true }, averageScore: { $exists: true } })
            .sort({ averageScore: -1 });

        res.status(200).json({ districts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Rayonların statistikasının alınmasında xəta", error });
    }
}
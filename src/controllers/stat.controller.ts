import { Request, Response } from "express";
import mongoose from "mongoose";
import StudentResult from "../models/studentResult.model";
import Student from "../models/student.model";

export const updateStatistics = async (req: Request, res: Response) => {
    try {
        // Statistikaları yenilə
        /**
         * 1. Пробегаемся по всем результатам экзаменов (StudentResult)
         * 2. Группируем результаты по студентам (Student)
         * 3. Каждому студенту в score записываем количество его экзаменов
         * 4. Каждому студенту в maxLevel записываем максимальный уровень, который он прошел
         *    Уровни: 0-15: E, 16-25: D, 26-34: C, 35-41: B, 42-46: A, 47-50: Lisey
         * 5. Каждому студенту в status записываем статус: если уровень поднялся (по хронологии экзаменов), то в статус пишем "inkişaf edən şagird". А также добавляем в его score 10, в его район, школу и учителю тоже 10
         * 6. Если студент в своём районе набрал самый высокий балл по последнему экзамену, то в его статус пишем (добавляем) "ayın şagirdi". А также добавляем в его score 5, в его район, школу и учителю тоже 5
         * 7. Если студент среди всех набрал самый высокий балл по последнему экзамену, то в его статус пишем (добавляем) "Respublika üzrə ayın şagirdi". А также добавляем в его score 5, в его район, школу и учителю тоже 5
         * 8. Сохраняем все результаты в районы, школы, учителя и студенты
         */

        // 1. Пробегаемся по всем результатам экзаменов (StudentResult)
        const studentResults = await StudentResult.find()
            .populate("student")
            .populate("exam")
            .sort({ examDate: 1 });
        
        // 2. Группируем результаты по студентам (Student)
        const students: any = {};
        studentResults.forEach((studentResult: any) => {
            if (!students[studentResult.student._id]) {
                students[studentResult.student._id] = {
                    student: studentResult.student,
                    results: [],
                };
            }

            students[studentResult.student._id].results.push(studentResult);
        });

        // 3. Каждому студенту в score записываем количество его экзаменов
        // 4. Каждому студенту в maxLevel записываем максимальный уровень, который он прошел, без учёта последнего экзамена
        //    Уровни: 0-15: E, 16-25: D, 26-34: C, 35-41: B, 42-46: A, 47-50: Lisey
        for (const studentId in students) {
            const student = students[studentId];
            student.student.score += student.results.length;
            // исключаем последний экзамен, так как он определяет статус студента
            student.student.maxLevel = student.results.slice(1).reduce((maxLevel: number, result: any) => {
                return Math.max(maxLevel, result.totalScore);
            }, 0);
            const studentMaxlevel: string = calculateLevel(student.student.maxLevel);
            const studentLastLevel: string = calculateLevel(student.results[0].totalScore);

            if (student.student.maxLevel < student.results[0].totalScore && studentMaxlevel !== studentLastLevel) {
                student.student.status.push("İnkişaf edən şagird");
                student.student.maxLevel = student.results[0].totalScore;
                // обновляем в базе данных статус студента
                // await Student.findByIdAndUpdate(studentId, { status: "İnkişaf edən şagird", maxLevel: student.student.maxLevel }, { new: true });
            }
        }

        // 6. Если студент в своём районе набрал самый высокий балл по последнему экзамену, то в его статус пишем (добавляем) "ayın şagirdi". А также добавляем в его score 5, в его район, школу и учителю тоже 5
        // 7. Если студент среди всех набрал самый высокий балл по последнему экзамену, то в его статус пишем (добавляем) "Respublika üzrə ayın şagirdi". А также добавляем в его score 5, в его район, школу и учителю тоже 5
        const districts: any = {};
        const schools: any = {};
        const teachers: any = {};
        // сначала выясняем самый высокий бал по всем студентам
        let maxTotalScore = 0;
        for (const studentId in students) {
            const student = students[studentId];
            maxTotalScore = Math.max(maxTotalScore, student.results[0].totalScore);
        }
        // теперь всем студентам с этим баллом добавляем статус "Respublika üzrə ayın şagirdi"
        for (const studentId in students) {
            const student = students[studentId];
            if (student.results[0].totalScore === maxTotalScore) {
                student.student.status.push("Respublika üzrə ayın şagirdi");
                student.student.score += 5;
                // обновляем в базе данных статус студента
                // await Student.findByIdAndUpdate(studentId, { status: "Respublika üzrə ayın şagirdi" }, { new: true });
            }
            // добавляем студента в район
            if (!districts[student.student.district]) {
                districts[student.student.district] = 0;
            }
            districts[student.student.district] += 5;
            // добавляем студента в школу
            if (!schools[student.student.school]) {
                schools[student.student.school] = 0;
            }
            schools[student.student.school] += 5;
            // добавляем студента в
        }
        res.status(200).json({ message: "Statistika yeniləndi" });
    } catch (error) {
        res.status(500).json({ message: "Statistikaların yenilənməsində xəta", error });
    }
}

const calculateLevel = (totalScore: number): string => {
    if (totalScore >= 16 && totalScore <= 25) {
        return "D";
    } else if (totalScore >= 26 && totalScore <= 34) {
        return "C";
    } else if (totalScore >= 35 && totalScore <= 41) {
        return "B";
    } else if (totalScore >= 42 && totalScore <= 46) {
        return "A";
    } else if (totalScore >= 47) {
        return "Lisey";
    } else {
        return "E";
    }
}
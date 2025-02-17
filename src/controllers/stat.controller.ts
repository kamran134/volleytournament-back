import { Request, Response } from "express";
import StudentResult, { IStudentResult, IStudentResultsGrouped } from "../models/studentResult.model";
import { IStudent } from "../models/student.model";
import District from "../models/district.model";
import School from "../models/school.model";
import Teacher from "../models/teacher.model";
import Exam, { IExam } from "../models/exam.model";
import { getExamsByMonthYear } from "./exam.controller";

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

// export const updateStatisticsByRepublic = async (req: Request, res: Response) => {
//     try {
//         await updateStatsByRepublic();
//         res.status(200).json({ message: "Respublika üzrə statistika uğurla yeniləndi!" });
//     } catch (error) {
//         res.status(500).json({ message: "Respublika üzrə statistikanın yenilənməsində xəta", error });
//     } 
// }

export const resetStats = async (): Promise<void> => {
    try {
        await StudentResult.updateMany({ status: "", score: 1 });
    } catch (error) {
        console.error(error);
    }
}

export const updateStats = async (): Promise<number> => {
    try {
        // Сначала сбрасываем всю статистику
        await resetStats();
        
        // Получаем все даты экзаменов (только поле date)
        const exams: IExam[] = await Exam.find({}, { date: 1 });

        if (!exams.length) {
            console.log("Нет экзаменов в базе.");
            return 404;
        }

        // Создаём Set для хранения уникальных (год, месяц)
        const uniqueMonths = new Set<string>();

        for (const exam of exams) {
            const date = new Date(exam.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Январь — 1, Февраль — 2 и т. д.
            uniqueMonths.add(`${year}-${month}`);
        }

        // Преобразуем в массив и сортируем по дате (по возрастанию)
        const sortedMonths = Array.from(uniqueMonths)
            .map(m => {
                const [year, month] = m.split("-").map(Number);
                return { year, month };
            })
            .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

        console.log(`Будет обработано ${sortedMonths.length} месяцев...`);
        await markDevelopingStudents(new Date().getMonth(), new Date().getFullYear());
        // Вызываем `markTopStudents()` для каждого месяца
        for (const { year, month } of sortedMonths) {
            console.log(`🔹 Обрабатываем ${month}/${year}...`);
            //await markDevelopingStudents(month, year);
            await markTopStudents(month, year);
            await markTopStudentsRepublic(month, year);
            
        }

        console.log("✅ Обработка всех месяцев завершена.");
        return 200;
    } catch (error) {
        throw error;
    }
}

export const detectDevelopingStudents = async () => {
    try {
        // 1. Пробегаемся по всем результатам экзаменов (StudentResult)
        const studentResultsGrouped: IStudentResultsGrouped[] = await getStudentResultsGroupedByStudent();
        if (studentResultsGrouped.length === 0) return 404;
        
        for (const studentId in studentResultsGrouped) {
            const student = studentResultsGrouped[studentId];
            student.results[0].status = "";
            if (student.results.length <= 1) continue;
            // исключаем последний экзамен, так как он определяет статус студента
            student.student.maxLevel = student.results.slice(1).reduce((maxLevel: number, result: any) => {
                return Math.max(maxLevel, result.totalScore);
            }, 0);
            const studentMaxlevel: string = calculateLevel(student.student.maxLevel);
            const studentLastLevel: string = calculateLevel(student.results[0].totalScore);

            if (student.student.maxLevel < student.results[0].totalScore && student.results.length > 1 &&
                studentMaxlevel !== studentLastLevel) {
                student.results[0].status = "İnkişaf edən şagird";
                student.results[0].score += 10;
                student.student.maxLevel = student.results[0].totalScore;

                await StudentResult.findByIdAndUpdate(student.results[0]._id, {
                    status: student.results[0].status,
                    score: student.results[0].score
                });
            }
        }
    } catch (error) {
        throw error;
    }
}

export const markDevelopingStudents = async (month: number, year: number): Promise<void> => {
    try {
        console.log(`🔹 Анализируем прогресс студентов до ${month}/${year}...`);

        // 1️⃣ Определяем диапазон дат (до указанного месяца)
        const endDate = new Date(year, month - 1, 31, 23, 59, 59, 999);

        // 2️⃣ Получаем все экзамены до этого месяца
        const exams = await Exam.find({
            date: { $lte: endDate }
        });

        if (!exams.length) {
            console.log("Нет экзаменов за указанный период.");
            return;
        }

        // 3️⃣ Извлекаем ID экзаменов
        const examIds = exams.map(exam => exam._id);

        // 4️⃣ Получаем все результаты по этим экзаменам
        const results: IStudentResult[] = await StudentResult.find({
            exam: { $in: examIds }
        }).populate("student").populate("exam");

        if (!results.length) {
            console.log("Нет результатов экзаменов за этот период.");
            return;
        }

        // 5️⃣ Группируем результаты по студентам
        const studentResultsGrouped: Record<string, IStudentResult[]> = results.reduce((acc, result) => {
            const studentId: string = String(result.student._id);
            if (!acc[studentId]) {
                acc[studentId] = [];
            }
            acc[studentId].push(result);
            return acc;
        }, {} as Record<string, IStudentResult[]>);

        const bulkOperations = [];

        // 6️⃣ Анализируем студентов
        for (const studentId in studentResultsGrouped) {
            const studentResults = studentResultsGrouped[studentId];

            // console.log("stud results: ", studentResults);
            // Сортируем экзамены по дате (от старого к новому)
            studentResults.sort((a, b) => a.exam.date.getTime() - b.exam.date.getTime());

            // Обнуляем статус у самого нового результата (текущий месяц)
            //studentResults[studentResults.length - 1].status = "";

            if (studentResults.length <= 1) continue; // Пропускаем студентов с 1 экзаменом

            // 7️⃣ Определяем максимальный результат за предыдущие экзамены
            const maxPreviousTotalScore = Math.max(
                ...studentResults.slice(0, -1).map(r => r.totalScore)
            );

            const currentResult = studentResults[studentResults.length - 1];

            // 8️⃣ Проверяем, если текущий результат выше всех предыдущих
            if (currentResult.totalScore > maxPreviousTotalScore) {
                const previousLevel = calculateLevel(maxPreviousTotalScore);
                const currentLevel = calculateLevel(currentResult.totalScore);

                if (previousLevel !== currentLevel) {
                    // Добавляем статус и прибавляем 10 очков
                    const updatedStatus = currentResult.status
                        ? `${currentResult.status}, İnkişaf edən şagird`
                        : "İnkişaf edən şagird";

                    bulkOperations.push({
                        updateOne: {
                            filter: { _id: currentResult._id },
                            update: { $set: { status: updatedStatus }, $inc: { score: 10 } }
                        }
                    });
                }
            }
        }

        // 9️⃣ Выполняем массовое обновление
        if (bulkOperations.length > 0) {
            await StudentResult.bulkWrite(bulkOperations);
            console.log(`✅ ${bulkOperations.length} nəfər inkişaf edən şagird.`);
        } else {
            console.log("Не найдено учеников для обновления.");
        }
    } catch (error) {
        console.error("Ошибка в markDevelopingStudents:", error);
    }
};

export const markTopStudents = async (month: number, year: number): Promise<void> => {
    const exams = await getExamsByMonthYear(month, year);

    if (!exams.length) {
        console.log("Нет экзаменов за этот период.");
        return;
    }

    // Извлекаем ID экзаменов
    const examIds = exams.map(exam => exam._id);

    // await StudentResult.updateMany(
    //     { exam: { $in: examIds } },
    //     { $set: { status: "", score: 0 } }
    // );

    // Получаем все результаты по найденным экзаменам
    const results: IStudentResult[] = await StudentResult.find({
        exam: { $in: examIds }
    }).populate("student");

    if (!results.length) {
        console.log("Нет результатов экзаменов за этот период.");
        return;
    }

    // Группируем результаты по районам
    const districtGroups: Record<string, IStudentResult[]> = results.reduce((acc, result) => {
        const districtId = result.student.district?.toString();
        if (!districtId) return acc;

        if (!acc[districtId]) {
            acc[districtId] = [];
        }
        acc[districtId].push(result);
        return acc;
    }, {} as Record<string, IStudentResult[]>);

    // Список обновлений
    const bulkOperations = [];

    for (const districtId in districtGroups) {
        const districtResults = districtGroups[districtId];

        // Находим максимальный totalScore в этом районе
        const maxTotalScore = Math.max(...districtResults.map(r => r.totalScore));
        // Если статус не лицейный, то это не успех
        if (maxTotalScore < 47) continue;

        // Определяем лучших учеников
        const topStudents = districtResults.filter(r => r.totalScore === maxTotalScore);

        for (const studentResult of topStudents) {
            const updatedStatus = studentResult.status
                ? `${studentResult.status}, Ayın şagirdi`
                : "Ayın şagirdi";

            bulkOperations.push({
                updateOne: {
                    filter: { _id: studentResult._id },
                    update: { $set: { status: updatedStatus}, $inc: { score: 5 } }
                }
            });
        }
    }

    // Выполняем массовое обновление
    if (bulkOperations.length > 0) {
        await StudentResult.bulkWrite(bulkOperations);
        console.log(`${bulkOperations.length} nəfər ayın şagirdi tapıldı.`);
    } else {
        console.log("Не найдено учеников для обновления.");
    }
}

async function markTopStudentsRepublic(month: number, year: number): Promise<void> {
    const exams = await getExamsByMonthYear(month, year);

    if (!exams.length) {
        console.log("Нет экзаменов за этот период.");
        return;
    }

    // Извлекаем ID экзаменов
    const examIds = exams.map(exam => exam._id);

    // await StudentResult.updateMany(
    //     { exam: { $in: examIds } },
    //     { $set: { status: "", score: 0 } }
    // );

    // Получаем все результаты по найденным экзаменам
    const results: IStudentResult[] = await StudentResult.find({
        exam: { $in: examIds }
    });

    if (!results.length) {
        console.log("Нет результатов экзаменов за этот период.");
        return;
    }

    // Находим максимальный totalScore по всей республике
    const maxTotalScore = Math.max(...results.map(r => r.totalScore));

    // Определяем лучших учеников
    const topStudents = results.filter(r => r.totalScore === maxTotalScore);

    // Список обновлений
    const bulkOperations = topStudents.map(studentResult => ({
        updateOne: {
            filter: { _id: studentResult._id },
            update: {
                $set: {
                    status: studentResult.status
                        ? `${studentResult.status}, Respublika üzrə ayın şagirdi`
                        : "Respublika üzrə ayın şagirdi",
                },
                $inc: {
                    score: 5
                }
            }
        }
    }));

    // Выполняем массовое обновление
    if (bulkOperations.length > 0) {
        await StudentResult.bulkWrite(bulkOperations);
        console.log(`Обновлено ${bulkOperations.length} записей.`);
    } else {
        console.log("Не найдено учеников для обновления.");
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

async function getStudentResultsGroupedByStudent(): Promise<IStudentResultsGrouped[]> {
    return await StudentResult.aggregate([
        {
            $lookup: {
                from: "students",
                localField: "student",
                foreignField: "_id",
                as: "student"
            }
        },
        { $unwind: "$student" },
        {
            $lookup: {
                from: "exams",
                localField: "exam",
                foreignField: "_id",
                as: "exam"
            }
        },
        { $unwind: "$exam" },
        { $sort: { "exam.date": -1 } },
        {
            $group: {
                _id: "$student._id",
                student: { $first: "$student" },
                results: {
                    $push: {
                        _id: "$_id",
                        exam: "$exam",
                        grade: "$grade",
                        disciplines: "$disciplines",
                        totalScore: "$totalScore",
                        score: "$score",
                        level: "$level",
                        status: "$status"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                student: 1,
                results: 1
            }
        }
    ]) as IStudentResultsGrouped[];
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
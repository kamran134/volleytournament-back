import { DeleteResult } from "mongoose";
import Exam from "../models/exam.model";
import Student, { IStudent, IStudentInput } from "../models/student.model";
import StudentResult, { IStudentResult, IStudentResultsGrouped } from "../models/studentResult.model";
import { calculateLevel } from "./common.service";
import { getExamsByMonthYear } from "./exam.service";
import { assignTeacherToStudent } from "./student.service";

export const processStudentResults = async (studentDataToInsert: IStudentInput[]): 
    Promise<{students: IStudent[], studentsWithoutTeacher: number[]}> => {
    try {
        const studentCodes: number[] = studentDataToInsert.map(item => item.code);
        const existingStudents: IStudent[] = await Student.find({ code: { $in: studentCodes } });
        const newStudents = studentDataToInsert.filter(student => !existingStudents.map(d => d.code).includes(student.code));

        // Assign teacher to student
        await Promise.all(newStudents.map(async (student) => {
            await assignTeacherToStudent(student);
        }));

        const studentsWithTeacher: IStudentInput[] = newStudents.filter(student => student.teacher);
        const studentsWithoutTeacher: number[] = newStudents.filter(student => !student.teacher).map(student => student.code);
        
        const newStudentsDocs = await Student.insertMany(studentsWithTeacher);
        const newStudentsIds: IStudent[] = newStudentsDocs.map(doc => doc.toObject() as IStudent);
        const allStudents: IStudent[] = existingStudents.concat(newStudentsIds);
        return {students: allStudents, studentsWithoutTeacher};
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

export async function markTopStudentsRepublic(month: number, year: number): Promise<void> {
    const exams = await getExamsByMonthYear(month, year);

    if (!exams.length) {
        console.log("Нет экзаменов за этот период.");
        return;
    }

    // Извлекаем ID экзаменов
    const examIds = exams.map(exam => exam._id);

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

export const deleteStudentResultsByExamId = async (examId: string): Promise<DeleteResult> => {
    try {
        return await StudentResult.deleteMany({ exam: examId });
    } catch (error) {
        throw error;
    }
}

export const deleteStudentResultsByExams = async (examIds: string[]): Promise<DeleteResult> => {
    try {
        return await StudentResult.deleteMany({ exam: { $in: examIds } });
    } catch (error) {
        throw error;
    }
}

export const deleteStudentResultsByStudentId = async (studentId: string): Promise<DeleteResult> => {
    try {
        return await StudentResult.deleteMany({ student: studentId });
    } catch (error) {
        throw error;
    }
}

export const deleteStudentResultsByStudents = async (studentIds: string[]): Promise<DeleteResult> => {
    try {
        return await StudentResult.deleteMany({ student: { $in: studentIds } });
    } catch (error) {
        throw error;
    }
}
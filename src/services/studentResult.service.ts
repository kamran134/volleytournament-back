import { DeleteResult } from "mongoose";
import Exam from "../models/exam.model";
import Student, { IStudent, IStudentInput } from "../models/student.model";
import StudentResult, { IStudentResult, IStudentResultsGrouped } from "../models/studentResult.model";
import { calculateLevel, calculateLevelNumb } from "./common.service";
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

export const markAllDevelopingStudents = async (): Promise<void> => {
    try {
        /*
        1. Вызываем всех студентов из базы данных
        2. Пробегаемся по всем результатам экзаменов, отсортированных по дате (StudentResult), обнуляем статусы
        3. Получаем все результаты экзаменов для каждого студента
        4. Если у студента на каком-то этапе поднялся уровень, то добавляем статус "İnkişaf edən şagird" на текущий результат
        5. Если у студента не меняется уровень или понижается, то статус результата остается пустым
        ВАЖНО! Проверяем попарно, проходимся для каждого студента по всем результатам и сравниваем с предыдущими
        Если у студента нет результатов, то пропускаем его, если у студента 1 результат, то пропускаем его
        ВАЖНО! Нам не нужен максимальный результат. Мы просто идём по циклу и сравниваем с предыдущими результатами
        */
        console.log("🔄 Обновление статусов студентов...");
        
        const studentResultsGrouped: IStudentResultsGrouped[] = await getStudentResultsGroupedByStudent();
        if (studentResultsGrouped.length === 0) return;
        const bulkOperations = [];

        console.log("Найдено ", studentResultsGrouped.length, " студентов с результатами экзаменов.");

        for (const student of studentResultsGrouped) {
            if (student.results.length <= 1) continue; // Пропускаем студентов с 1 результатом

            // Обнуляем статус у самого нового результата (текущий месяц)
            student.results[0].status = "";
            student.results[0].score = 1;

            let maxTotalScore = student.results[0].totalScore;
            let maxLevel = calculateLevelNumb(maxTotalScore);

            for (let i = 1; i < student.results.length; i++) {
                const currentResult = student.results[i];

                // Обнуляем статус у самого нового результата (текущий месяц)
                currentResult.status = "";
                currentResult.score = 1;

                if (calculateLevelNumb(currentResult.totalScore) > maxLevel) {
                    currentResult.status = "İnkişaf edən şagird";
                    currentResult.score += 10;
                    maxLevel = calculateLevelNumb(currentResult.totalScore);
                    maxTotalScore = currentResult.totalScore;
                }

                bulkOperations.push({
                    updateOne: {
                        filter: { _id: currentResult._id },
                        update: { $set: { status: currentResult.status, score: currentResult.score } }
                    }
                });
            }
        }

        // 4. Выполняем массовое обновление
        if (bulkOperations.length > 0) {
            await StudentResult.bulkWrite(bulkOperations);
            console.log(`✅ Обновлено ${bulkOperations.length} статусов студентов.`);
        } else {
            console.log("Не найдено студентов для обновления.");
        }

        console.log("✅ Статусы студентов обновлены.");
    } catch (error) {
        console.error("Ошибка в markAllDevelopingStudents:", error);
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

    if (!exams || !exams.length) {
        console.log("Нет экзаменов за этот период.");
        return;
    }

    // Извлекаем ID экзаменов
    const examIds = exams.map(exam => exam._id);

    // Получаем все результаты по найденным экзаменам
    const results: IStudentResult[] = await StudentResult.find({
        exam: { $in: examIds }
    }).populate<{ student: IStudent }>("student");

    if (!results || !results.length) {
        console.log("Нет результатов экзаменов за этот период.");
        return;
    }

    // Группируем результаты по районам
    const districtGradeGroups: Record<string, IStudentResult[]> = results.reduce((acc, result) => {
        if (!result.student || !result.student.district || result.student.grade === undefined || result.student.grade === null) {
            console.warn("Студент или район не найдены для результата:", result);
            return acc;
        }

        const districtId = result.student.district?.toString();
        const grade = result.student.grade;

        const groupKey = `${districtId}-${grade}`;

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(result);
        return acc;
    }, {} as Record<string, IStudentResult[]>);

    // Список обновлений
    const bulkOperations = [];

    for (const groupKey in districtGradeGroups) {
        const groupResults = districtGradeGroups[groupKey];

        // Находим максимальный totalScore в этом районе
        const maxTotalScore = Math.max(...groupResults.map(r => r.totalScore));
        // Если статус не лицейный, то это не успех
        if (maxTotalScore < 47) continue;

        // Определяем лучших учеников
        const topStudents = groupResults.filter(r => r.totalScore === maxTotalScore);

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

    if (!exams || !exams.length) {
        console.log("Нет экзаменов за этот период.");
        return;
    }

    // Извлекаем ID экзаменов
    const examIds = exams.map(exam => exam._id);

    // Получаем все результаты по найденным экзаменам
    const results: IStudentResult[] = await StudentResult.find({
        exam: { $in: examIds }
    });

    if (!results || !results.length) {
        console.log("Нет результатов экзаменов за этот период.");
        return;
    }

    // Группируем результаты по классам
    const gradeGroups: Record<number, IStudentResult[]> = results.reduce((acc, result) => {
        const grade = result.grade;
        if (grade === undefined || grade === null) {
            console.warn("Класс не найден для результата:", result);
            return acc;
        }

        if (!acc[grade]) {
            acc[grade] = [];
        }
        acc[grade].push(result);
        return acc;
    }, {} as Record<number, IStudentResult[]>);

    const bulkOperations = [];

    // Проходим по каждому классу и находим лучших учеников
    for (const grade in gradeGroups) {
        const gradeResults = gradeGroups[grade];

        // Находим максимальный totalScore по всей республике
        const maxTotalScore = Math.max(...gradeResults.map(r => r.totalScore));

        // Определяем лучших учеников
        const topStudents = gradeResults.filter(r => r.totalScore === maxTotalScore);

        for (const studentResult of topStudents) {
            const updatedStatus = studentResult.status
                ? `${studentResult.status}, Respublika üzrə ayın şagirdi`
                : "Respublika üzrə ayın şagirdi";

            bulkOperations.push({
                updateOne: {
                    filter: { _id: studentResult._id },
                    update: { $set: { status: updatedStatus }, $inc: { score: 5 } }
                }
            });
        }
    }
    
    // Выполняем массовое обновление
    if (bulkOperations.length > 0) {
        const result = await StudentResult.bulkWrite(bulkOperations);
        console.log(`Обновлено ${result.modifiedCount} записей.`);
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
        { $sort: { "exam.date": 1 } },
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
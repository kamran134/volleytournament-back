import Exam, { IExam } from "../models/exam.model";
import StudentResult from "../models/studentResult.model";
import { markDevelopingStudents, markTopStudents, markTopStudentsRepublic } from "./studentResult.service";

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
import District, { IDistrict } from "../models/district.model";
import StudentResult from "../models/studentResult.model";

export const checkExistingDistrict = async (district: IDistrict): Promise<boolean> => {
    try {
        const foundedDistrict = await District.find({ code: district.code });
        return foundedDistrict.length > 0;
    } catch (error) {
        console.error(error);
        return true;
    }
}

export const checkExistingDistricts = async (codes: number[]): Promise<IDistrict[]> => {
    try {
        const result = await District.find({ code: { $in: codes } });
        return result;
    } catch (error) {
        console.error(error);
        throw new Error("Не удалось осуществить поиск!");
    }
}

export const checkExistingDistrictCodes = async (codes: number[]): Promise<number[]> => {
    try {
        // Используем .distinct() для получения массива уникальных кодов
        const existingCodes = await District.distinct("code", { code: { $in: codes } });
        return existingCodes;
    } catch (error) {
        console.error("Ошибка при поиске:", error);
        throw new Error("Не удалось осуществить поиск!");
    }
};

export const countDistrictsRates = async (): Promise<void> => {
    try {
        console.log("🔄 Подсчёт коэффициентов районов...");

        const studentResults = await StudentResult.find().populate("student").populate("exam");

        const districtCounts = new Map<string, number>();
        const examDistrictIds = new Set<string>();
        for (const result of studentResults) {
            const districtId = result.student.district?.toString();
            const examId = result.exam?.toString();
            // Проверяем пару район-экзамен, если такой пары нет, то добавляем в мапу +1
            if (districtId && examId) {
                const examDistrictId = `${examId}-${districtId}`;
                if (!examDistrictIds.has(examDistrictId)) {
                    examDistrictIds.add(examDistrictId);
                    districtCounts.set(districtId, (districtCounts.get(districtId) || 0) + 1);
                }
            }
        }

        const bulkUpdates = Array.from(districtCounts.entries()).map(([districtId, rate]) => ({
            updateOne: {
                filter: { _id: districtId },
                update: { rate },
            },
        }));

        if (bulkUpdates.length > 0) {
            await District.bulkWrite(bulkUpdates);
        }

        console.log("✅ Коэффициенты районов подсчитаны!");
    } catch (error) {
        console.error(error);
        throw new Error("Не удалось подсчитать рейтинги!");
    }
}
import xlsx from "xlsx";

export const readExcel = (filePath: string): any[] => {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        return rows;
    } catch (error) {
        console.error(error);
        throw new Error("Fayl oxuna bilmədi");
    }
}
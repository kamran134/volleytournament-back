import fs from "fs";
import path from "path";

export const deleteFile = (filePath: string) => {
    const fileFullPath = path.join(__dirname, `../../${filePath}`);

    fs.unlink(fileFullPath, (err) => {
        if (err) {
            console.error(`Fayl silinən zamanı xəta baş verdi: ${err.message}`);
        } else {
            console.log(`Fayl ${fileFullPath} uğurla silindi.`);
        }
    });
}
export const calculateLevel = (totalScore: number): string => {
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

export const calculateLevelNumb = (totalScore: number): number => {
    if (totalScore >= 16 && totalScore <= 25) {
        return 2;
    } else if (totalScore >= 26 && totalScore <= 34) {
        return 3;
    } else if (totalScore >= 35 && totalScore <= 41) {
        return 4;
    } else if (totalScore >= 42 && totalScore <= 46) {
        return 5;
    } else if (totalScore >= 47) {
        return 6;
    } else {
        return 1;
    }
}
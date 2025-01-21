import mongoose, { Schema, Document } from "mongoose";
import { IDiscipline } from "./discipline.model";
import { IStudent } from "./student.model";
import { IExam } from "./exam.model";

export interface IStudentResultInput {
    studentId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    grade: number;
    disciplines: IDiscipline;
    totalScore: number;
    level: string;
}

export interface IStudentResult extends Document {
    student: IStudent;
    exam: IExam;
    grade: number;
    disciplines: IDiscipline;
    totalScore: number;
    level: string;
}

const StudentResultSchema: Schema = new Schema({
    student: { type: String, ref: 'Student' },
    exam: { type: String, ref: 'Exam' },
    grade: { type: Number, required: true },
    disciplines: { type: Map, of: Number, required: true },
    totalScore: { type: Number, required: true },
    level: { type: String, required: true }
});

export default mongoose.model<IStudentResult>("StudentResult", StudentResultSchema);
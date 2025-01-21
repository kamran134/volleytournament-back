import mongoose, { Schema, Document } from "mongoose";

export interface IExamInput {
    name: string;
    code: number;
    date: Date;
}

export interface IExam extends Document {
    name: string;
    code: number;
    date: Date;
}

const ExamSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: Number, required: true },
    date: { type: Date, required: true }
});

export default mongoose.model<IExam>("Exam", ExamSchema);
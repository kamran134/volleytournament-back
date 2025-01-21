import mongoose, { Schema, Document } from "mongoose";

export interface IStudentInput {
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number;
}

export interface IStudent extends Document {
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number; // sinif
}

const StudentSchema: Schema = new Schema({
    code: { type: Number, required: true },
    lastName: { type: String },
    firstName: { type: String, required: true },
    middleName: { type: String },
    grade: { type: Number }
});

export default mongoose.model<IStudent>("Student", StudentSchema);
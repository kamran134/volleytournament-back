import mongoose, { Schema, Document } from "mongoose";

export interface IStudentInput {
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number;
    teacher?: mongoose.Types.ObjectId;
    school?: mongoose.Types.ObjectId;
    district?: mongoose.Types.ObjectId;
}

export interface IStudent extends Document {
    _id: mongoose.Types.ObjectId;
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number; // sinif
    teacher?: mongoose.Types.ObjectId;
    school?: mongoose.Types.ObjectId;
    district?: mongoose.Types.ObjectId;
    score: number;
    maxLevel: number;
    status: string;
}

const StudentSchema: Schema = new Schema({
    code: { type: Number, required: true },
    lastName: { type: String },
    firstName: { type: String, required: true },
    middleName: { type: String },
    grade: { type: Number },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    school: { type: Schema.Types.ObjectId, ref: "School" },
    district: { type: Schema.Types.ObjectId, ref: "District" },
    maxLevel: { type: Number, required: false },
    status: { type: String, required: false },
});

export default mongoose.model<IStudent>("Student", StudentSchema);
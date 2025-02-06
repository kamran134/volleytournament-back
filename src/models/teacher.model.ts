import mongoose, { Schema, Document } from "mongoose";
import { ISchool } from "./school.model";

export interface ITeacherInput {
    schoolCode: number;
    code: number;
    fullname: string;
}

export interface ITeacher extends Document {
    school: ISchool;
    code: number;
    fullname: string;
    score: number;
}

const TeacherSchema: Schema = new Schema({
    school: { type: String, ref: 'School' },
    code: { type: Number, required: true, unique: true},
    fullname: { type: String, required: true },
    score: { type: Number, required: false },
    status: { type: String, required: false },
});

export default mongoose.model<ITeacher>("Teacher", TeacherSchema);
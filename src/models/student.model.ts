import mongoose, { Schema, Document, Types } from "mongoose";
import { ITeacher } from "./teacher.model";
import { ISchool } from "./school.model";
import { IDistrict } from "./district.model";
import { IStudentResult } from "./studentResult.model";

export interface IStudentInput {
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number;
    teacher?: Types.ObjectId;
    school?: Types.ObjectId;
    district?: Types.ObjectId;
}

export interface IStudent extends Document {
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number; // sinif
    teacher: ITeacher;
    school?: ISchool;
    district?: IDistrict;
    score: number;
    maxLevel: number;
    status: string;
}

export interface IStudentMini extends Document {
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    grade: number;
    teacher: Types.ObjectId;
    school: Types.ObjectId;
    district: Types.ObjectId;
    score: number;
    status: string;
    results: IStudentResult[];
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
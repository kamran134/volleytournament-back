import mongoose, { Schema, Document } from "mongoose";
import { ITeacher } from "./teacher.model";

export interface IStudent {
    teacherCode: number;
    code: number;
    lastName: string;
    firstName: string;
    middleName: string;
    
}
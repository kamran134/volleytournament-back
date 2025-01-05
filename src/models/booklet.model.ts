import mongoose, { Schema, Document } from "mongoose";

export interface IBookletInput {
    name: string;
    date: Date;
}

export interface IBooklet extends Document {
    name: string;
    date: Date;
}

const BookletSchema: Schema = new Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true }
});

export default mongoose.model<IBooklet>("Booklet", BookletSchema);
import mongoose, {Schema, Document} from "mongoose";

export interface IDistrict extends Document {
    code: number;
    region: string;
    name: string;
    score: number;
}

const DistrictSchema: Schema = new Schema({
    code: { type: Number, required: true },
    region: { type: String, required: false },
    name: { type: String, required: true },
    score: { type: Number, required: false },
    averageScore: { type: Number, required: false }
});

export default mongoose.model<IDistrict>("District", DistrictSchema);
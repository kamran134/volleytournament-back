import mongoose, {Schema, Document} from "mongoose";

export interface IDistrict extends Document {
    code: number;
    region: string;
    name: string;
}

const DistrictSchema: Schema = new Schema({
    code: { type: Number, required: true },
    region: { type: String, required: false },
    name: { type: String, required: true },
});

export default mongoose.model<IDistrict>("District", DistrictSchema);
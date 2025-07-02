import mongoose from "mongoose";

export interface IGamer extends Document {
    number: number;
    lastName: string;
    firstName: string;
    middleName?: string;
    email?: string;
    height?: number;
    birthDate: Date;
    role?: string;
    isCaptain: boolean;
    isCoach: boolean;
    team: mongoose.Types.ObjectId;
}

const GamerSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    height: { type: Number, required: false },
    birthDate: { type: Date, required: true },
    role: { type: String, required: false },
    isCaptain: { type: Boolean, default: false },
    isCoach: { type: Boolean, default: false },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }
}, {
    timestamps: true
});

export default mongoose.model<IGamer>("Gamer", GamerSchema);
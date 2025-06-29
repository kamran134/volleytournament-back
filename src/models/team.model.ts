import mongoose, { Types } from "mongoose";

export interface ITeam extends Document{
    name: string;
    shortName?: string;
    logoUrl?: string;
    country: string;
    city: string;
    players?: Types.ObjectId[];
    coaches?: Types.ObjectId[];
    captain?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: false, default: null },
    logoUrl: { type: String, required: false, default: null },
    country: { type: String, required: true },
    city: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gamer", required: false }],
    coaches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gamer", required: false }],
    captain: { type: mongoose.Schema.Types.ObjectId, ref: "Gamer", required: false }
}, {
    timestamps: true
});

export default mongoose.model<ITeam>("Team", TeamSchema);
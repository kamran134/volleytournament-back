import mongoose from "mongoose";

export interface ITournament extends mongoose.Document {
    name: string;
    shortName: string;
    logoUrl?: string;
    country: string;
    city: string;
    startDate: Date;
    endDate: Date;
    teams: mongoose.Types.ObjectId[];
    statute?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    logoUrl: { type: String, required: false },
    country: { type: String, required: true },
    city: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    statute: { type: String, required: false },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }]
}, {
    timestamps: true
});

export default mongoose.model<ITournament>("Tournament", TournamentSchema);
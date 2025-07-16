import mongoose from "mongoose";

export interface ITour extends mongoose.Document {
    name: string;
    tournament: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
}

export interface ITourWithGames extends ITour {
    games?: mongoose.Types.ObjectId[];
}

const TourSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, {
    timestamps: true
});

export default mongoose.model<ITour>("Tour", TourSchema);
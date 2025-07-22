import mongoose from "mongoose";
import { ITournament } from "./tournament.model";
import { ITour } from "./tour.model";
import { ITeam } from "./team.model";

export interface IPhoto extends mongoose.Document {
    id: string;
    url: string;
    description: string;
    tournament: mongoose.Types.ObjectId | ITournament;
    tour: mongoose.Types.ObjectId | ITour;
    team: mongoose.Types.ObjectId | ITeam;
    createdAt: Date;
    updatedAt: Date;
}

const PhotoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    description: { type: String, required: false },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
}, {
    timestamps: true
});

export default mongoose.model<IPhoto>("Photo", PhotoSchema);
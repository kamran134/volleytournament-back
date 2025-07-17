import mongoose from "mongoose";
import { ITour } from "./tour.model";
import { ITeam } from "./team.model";
import { IGameSet } from "./gameSet.model";
import { ILocation } from "./location.model";

export interface IGame extends mongoose.Document {
    name?: string;
    startDate: Date;
    endDate: Date;
    tournament: mongoose.Types.ObjectId;
    tour: mongoose.Types.ObjectId | ITour;
    team1: mongoose.Types.ObjectId | ITeam;
    team2: mongoose.Types.ObjectId | ITeam;
    scoreTeam1?: number;
    scoreTeam2?: number;
    winner?: mongoose.Types.ObjectId | ITeam;
    gameSets?: mongoose.Types.ObjectId[] | IGameSet[];
    location: mongoose.Types.ObjectId | ILocation;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema = new mongoose.Schema({
    name: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true  },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    team1: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    team2: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    scoreTeam1: { type: Number, required: false, default: 0 },
    scoreTeam2: { type: Number, required: false, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: false },
    gameSets: [{ type: mongoose.Schema.Types.ObjectId, ref: "GameSet", required: false }],
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
}, {
    timestamps: true
});

export default mongoose.model<IGame>("Game", GameSchema);
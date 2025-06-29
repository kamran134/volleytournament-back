import mongoose from "mongoose";

export interface IGame extends mongoose.Document {
    name: string;
    startDate: Date;
    endDate: Date;
    tournament?: mongoose.Types.ObjectId;
    teamA: mongoose.Types.ObjectId;
    teamB: mongoose.Types.ObjectId;
    winner?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true  },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: false },
}, {
    timestamps: true
});

export default mongoose.model<IGame>("Game", GameSchema);
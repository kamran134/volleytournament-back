import mongoose from "mongoose";

export interface IGameResult extends mongoose.Document {
    game: mongoose.Types.ObjectId;
    scoreTeam1: number;
    scoreTeam2: number;
    winner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GameResultSchema = new mongoose.Schema({
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    scoreTeam1: { type: Number, required: true },
    scoreTeam2: { type: Number, required: true },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }
}, {
    timestamps: true
});

export default mongoose.model<IGameResult>("GameResult", GameResultSchema);
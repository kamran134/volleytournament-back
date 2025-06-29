import mongoose from "mongoose";

export interface IGame extends mongoose.Document {
    name: string;
    startDate: Date;
    endDate: Date;
    gameResults?: mongoose.Types.ObjectId[];
    winner?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    gameResults: [{ type: mongoose.Schema.Types.ObjectId, ref: "GameResult" }],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: false }
}, {
    timestamps: true
});

export default mongoose.model<IGame>("Game", GameSchema);
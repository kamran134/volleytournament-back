import mongoose from "mongoose";

export interface ITournamentGamer extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    tournamentId: mongoose.Types.ObjectId;
    gamerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TournamentGamerSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    gamerId: { type: mongoose.Schema.Types.ObjectId, ref: "Gamer", required: true }
}, {
    timestamps: true
});

export const TournamentGamer = mongoose.model<ITournamentGamer>("TournamentGamer", TournamentGamerSchema);
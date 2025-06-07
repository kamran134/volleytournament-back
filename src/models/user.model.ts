import mongoose from "mongoose";

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: UserRole;
    isApproved: boolean;
}

export enum UserRole {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    COACH = "coach",
    CAPTAIN = "captain",
    USER = "user"
}

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["superadmin", "admin", "coach", "captain", "user"], default: "user" },
    isApproved: { type: Boolean, default: false }
});

export default mongoose.model<IUser>("User", UserSchema);
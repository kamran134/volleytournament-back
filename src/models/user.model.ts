import { Document, Schema, model } from "mongoose";
import { UserRole } from "../constants/roles";

export interface IUser extends Document {
    email: string;
    password?: string;
    passwordHash: string;
    role: UserRole;
    isApproved: boolean;
    // REFRESH TOKEN FIELDS - UNCOMMENT AFTER REFACTORING
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
        isApproved: { type: Boolean, default: false },
        // REFRESH TOKEN SCHEMA FIELDS - UNCOMMENT AFTER REFACTORING
        refreshToken: { type: String },
        refreshTokenExpiresAt: { type: Date },
    }, {
        timestamps: true,
    }
);

export default model<IUser>("User", UserSchema);
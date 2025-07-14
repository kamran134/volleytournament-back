import mongoose, { Document } from 'mongoose';

export interface ILocation extends Document {
    name: string;
    address: string;
    url: string;
    latitude?: number;
    longitude?: number;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    url: { type: String, required: true },
    latitude: { type: Number, required: false, default: null },
    longitude: { type: Number, required: false, default: null }
}, {
    timestamps: true
});

export default mongoose.model<ILocation>('Location', LocationSchema);
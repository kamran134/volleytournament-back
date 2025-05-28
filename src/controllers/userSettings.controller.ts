import { Request, Response } from "express";
import UserSettings, { IUserSettings } from "../models/userSettings.model";

export const getUserSettings = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId;
        const settings = await UserSettings.findOne({ userId });
        res.json(settings);
    } catch (error) {
        console.error("Error fetching user settings:", error);
        throw new Error("Failed to fetch user settings");
    }
}

export const updateUserSettings = async (req: Request, res: Response) => {
    try {
        const settingsData: Partial<IUserSettings> = req.body;

        const updatedSettings = await UserSettings.findOneAndUpdate(
            { userId: settingsData.userId },
            { $set: settingsData },
            { new: true, upsert: true }
        );
        if (!updatedSettings) {
            res.status(404).json({ error: "User settings not found" });
            return;
        }
        res.json({updatedSettings, message: "Sütunlar uğurla yeniləndi"});
    } catch (error) {
        console.error("Error updating user settings:", error);
        throw new Error("Failed to update user settings");
    }
}
import UserSettings, { IUserSettings } from '../models/userSettings.model';

export const getUserSettings = async (userId: string): Promise<IUserSettings | null> => {
    try {
        const settings = await UserSettings.findOne({ userId });
        return settings;
    } catch (error) {
        console.error("Error fetching user settings:", error);
        throw new Error("Failed to fetch user settings");
    }
}

export const updateUserSettings = async (userId: string, settingsData: Partial<IUserSettings>): Promise<IUserSettings | null> => {
    try {
        const updatedSettings = await UserSettings.findOneAndUpdate(
            { userId },
            { $set: settingsData },
            { new: true, upsert: true }
        );
        return updatedSettings;
    } catch (error) {
        console.error("Error updating user settings:", error);
        throw new Error("Failed to update user settings");
    }
}
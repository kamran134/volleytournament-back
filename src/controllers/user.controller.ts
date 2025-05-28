import { Request, Response } from 'express';
import { editUser, getFilteredUsers } from '../services/user.service';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { data, totalCount } = await getFilteredUsers(req);
        res.status(200).json({ data, totalCount, message: "Users retrieved successfully" });
    }
    catch (error) {
        console.error("Şagirdlərin alınmasında xəta:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updateData = req.body;
        const id = updateData._id;

        if (!id) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }

        await editUser(id, updateData);
        
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("User update error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
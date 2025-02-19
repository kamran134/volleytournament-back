import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            res.status(400).json({ message: "Yanlış məlumatlar!" });
            return;
        }

        if (!user?.isApproved) {
            res.status(403).json({ message: "Adminin təstiqi mütləqdir!" });
            return;
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.json({ message: "Uğurlu avtorizasiya", role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Serverdə xəta!" });
        console.error(error);
    }
}

export const register = async (req: Request, res: Response) => {
    const { email, password, role } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "İstifadəçi artıq mövcuddur!" });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
            email, passwordHash, role, isApproved: role === "superadmin"
        });

        await newUser.save();
        res.status(201).json({ message: "İstifadəçi qeydiyyatdan keçdi. Təsdiq gözlənilir." })
    } catch (error) {
        res.status(500).json({ message: "Serverdə xəta!" });
        console.error(error);
    }
}

export const approveUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        if (!user) {
            res.status(404).json({ message: "İstifadəçi tapılmadı!" });
            return;
        }

        res.json({ message: "İstifadəçi təsdiq edildi!", user });
    } catch (error) {
        res.status(500).json({ message: "Serverdə xəta!" });
        console.error(error);
    }
}

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token").json({ message: "Sistemdən çıxdınız" });
}
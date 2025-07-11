import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tournamentRoutes from "./routes/tournament.routes";
import teamRoutes from "./routes/team.routes";
import gamerRoutes from "./routes/gamer.routes";
import gameRoutes from "./routes/game.routes";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware";
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|webp/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    }
});

dontenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
    origin: ['http://localhost:4200', 'https://42n.space'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Limit requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 300 // Ограничивает 100 запросов с одного IP за 15 минут
});
app.use(limiter);

app.get("/", (req, res) => {
    res.send("API is running!");
});

// Routes
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/gamers", gamerRoutes);
app.use("/api/games", gameRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
    res.status(404).json({ message: 'Məlumat tapılmadı' });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${PORT}`);
});
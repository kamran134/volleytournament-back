import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tournamentRoutes from "./routes/tournament.routes";
import tourRoutes from "./routes/tour.routes";
import teamRoutes from "./routes/team.routes";
import gamerRoutes from "./routes/gamer.routes";
import gameRoutes from "./routes/game.routes";
import locationRoutes from "./routes/location.routes";
import photoRoutes from "./routes/photo.routes";
import statRoutes from "./routes/stat.routes";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware";
import path from 'path';

dontenv.config();
connectDB();

const app = express();
app.set('trust proxy', 1); // Trust first proxy for rate limiting
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Разрешает кросс-доменные запросы
}));
app.use(morgan("dev"));
app.use(cors({
    origin: ['http://localhost:4200', 'https://42n.space', 'https://volleytour.az'],
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
app.use("/api/tours", tourRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/gamers", gamerRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/photos", photoRoutes)

app.use("/uploads", cors({
    origin: ['http://localhost:4200', 'https://42n.space', 'https://volleytour.az'],
    credentials: true
}), (req, res, next) => {
    console.log('Serving file:', req.path); // Лог для отладки
    next();
}, express.static(path.join(__dirname, "..", "uploads")));

app.use((req, res, next) => {
    res.status(404).json({ message: 'Məlumat tapılmadı' });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${PORT}`);
});
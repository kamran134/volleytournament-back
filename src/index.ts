import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import connectDB from "./config/db";
import districtRoutes from "./routes/district.routes";
import schoolRoutes from "./routes/school.routes";
import teacherRoutes from "./routes/teacher.routes";
import bookletRoutes from "./routes/booklet.routes";
import examRoutes from "./routes/exam.routes";
import studentRoutes from "./routes/student.routes";
import studentResultRoutes from "./routes/studentResult.routes";
import statRoutes from "./routes/stat.routes";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";

dontenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("API is running!");
});

// Middleware для JSON
app.use(express.json()); // Добавляет поддержку application/json
// Или (если используете body-parser)
// app.use(bodyParser.json());

app.use("/api/districts", districtRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/booklets", bookletRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student-results", studentResultRoutes);
app.use("/api/stats", statRoutes);
app.use("/auth", authRoutes)

app.use((req, res, next) => {
    res.status(404).json({ message: 'Məlumat tapılmadı' });
});

app.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${PORT}`);
});
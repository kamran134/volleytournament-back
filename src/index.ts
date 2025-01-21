import express from "express";
import cors from "cors";
import dontenv from "dotenv";
import connectDB from "./config/db";
import districtRoutes from "./routes/district.routes";
import schoolRoutes from "./routes/school.routes";
import teacherRoutes from "./routes/teacher.routes";
import bookletRoutes from "./routes/booklet.routes";
import examRoutes from "./routes/exam.routes";

dontenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express());

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

app.use((req, res, next) => {
    res.status(404).json({ message: 'Məlumat tapılmadı' });
});

app.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${PORT}`);
});
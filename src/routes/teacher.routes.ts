import express from "express";
import multer from "multer";
import { createAllTeachers, createTeacher, getTeachers } from "../controllers/teacher.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.route("/").get(getTeachers).post(createTeacher);
router.route("/upload").post(upload.single("file"), createAllTeachers);

export default router;
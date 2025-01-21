import express from "express";
import { createExam, getExams } from "../controllers/exam.controller";

const router = express.Router();

router.route("/").get(getExams).post(createExam);

export default router;
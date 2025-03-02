import express from "express";
import { getSchoolStatistics, getStudentsStatistics, getStatisticsByExam, getTeacherStatistics, updateStatistics } from "../controllers/stat.controller";

const router = express.Router();

router.route("/").post(updateStatistics);
router.route("/students").get(getStudentsStatistics);
router.route("/by-exam/:examId").get(getStatisticsByExam);
router.route("/teachers").get(getTeacherStatistics);
router.route("/schools").get(getSchoolStatistics);

export default router;
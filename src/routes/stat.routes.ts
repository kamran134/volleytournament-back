import express from "express";
import { getSchoolStatistics, getStatistics, getStatisticsByExam, getTeacherStatistics, updateStatistics } from "../controllers/stat.controller";

const router = express.Router();

router.route("/").get(getStatistics).post(updateStatistics);
router.route("/by-exam/:examId").get(getStatisticsByExam);
router.route("/teachers").get(getTeacherStatistics);
router.route("/schools").get(getSchoolStatistics);
// router.route("/calculate-scores").post(calculateAndSaveScores);

export default router;
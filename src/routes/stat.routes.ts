import express from "express";
import { getStatistics, getStatisticsByExam, updateStatistics } from "../controllers/stat.controller";

const router = express.Router();

router.route("/").get(getStatistics).post(updateStatistics);
router.route("/by-exam/:examId").get(getStatisticsByExam);
// router.route("/calculate-scores").post(calculateAndSaveScores);

export default router;
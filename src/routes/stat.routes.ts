import express from "express";
import { calculateAndSaveScores, getStatistics, updateStatistics } from "../controllers/stat.controller";

const router = express.Router();

router.route("/").get(getStatistics).post(updateStatistics);
// router.route("/by-republic").post(updateStatisticsByRepublic);
router.route("/calculate-scores").post(calculateAndSaveScores);

export default router;
import express from "express";
import { calculateAndSaveScores, updateStatistics, updateStatisticsByRepublic } from "../controllers/stat.controller";

const router = express.Router();

router.route("/").post(updateStatistics);
router.route("/by-republic").post(updateStatisticsByRepublic);
router.route("/calculate-scores").post(calculateAndSaveScores);

export default router;
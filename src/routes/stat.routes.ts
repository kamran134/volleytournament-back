import express from "express";
import { updateStatistics } from "../controllers/stat.controller";

const router = express.Router();

router.route("/").post(updateStatistics);

export default router;
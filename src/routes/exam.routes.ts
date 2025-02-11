import express from "express";
import { createExam, deleteAllExams, deleteExam, getExams } from "../controllers/exam.controller";

const router = express.Router();

router.route("/").get(getExams).post(createExam).delete(deleteAllExams);
router.route("/:id").delete(deleteExam);

export default router;
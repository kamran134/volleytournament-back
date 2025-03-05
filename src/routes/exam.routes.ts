import express from "express";
import { createExam, deleteAllExams, deleteExam, getExams } from "../controllers/exam.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.route("/")
    .get(getExams)
    .post(authMiddleware(["superadmin", "admin"]), createExam)
    .delete(authMiddleware(["superadmin", "admin"]), deleteAllExams);
router.route("/:id")
    .delete(authMiddleware(["superadmin", "admin"]), deleteExam);

export default router;
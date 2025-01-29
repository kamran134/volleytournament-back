import express from "express";
import { getStudents, getStudent } from "../controllers/student.controller";

const router = express.Router();

router.route("/").get(getStudents);
router.route("/:id").get(getStudent);

export default router;
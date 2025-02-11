import express from "express";
import { getStudents, getStudent, deleteAllStudents, deleteStudent } from "../controllers/student.controller";

const router = express.Router();

router.route("/").get(getStudents).delete(deleteAllStudents);
router.route("/:id").get(getStudent).delete(deleteStudent);

export default router;
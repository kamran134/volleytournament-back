import express from "express";
import { getStudents, getStudent, deleteAllStudents, deleteStudent, deleteStudentsByIds } from "../controllers/student.controller";

const router = express.Router();

router.route("/").get(getStudents).delete(deleteAllStudents);
router.route("/:id").get(getStudent).delete(deleteStudent);
router.route("/delete/:studentIds").delete(deleteStudentsByIds);

export default router;
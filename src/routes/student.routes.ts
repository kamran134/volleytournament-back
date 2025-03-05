import express from "express";
import { getStudents, getStudent, deleteAllStudents, deleteStudent, deleteStudentsByIds, searchStudents } from "../controllers/student.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.route("/")
    .get(getStudents)
    .delete(authMiddleware(["superadmin", "admin"]), deleteAllStudents);
router.route("/:id").get(getStudent)
    .delete(authMiddleware(["superadmin", "admin"]), deleteStudent);
router.route("/search/:searchString").get(searchStudents);
router.route("/delete/:studentIds")
    .delete(authMiddleware(["superadmin", "admin"]), deleteStudentsByIds);

export default router;
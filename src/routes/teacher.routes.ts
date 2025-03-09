import express from "express";
import multer from "multer";
import { createAllTeachers, createTeacher, deleteTeacher, deleteTeachersByIds, getTeachers, getTeachersForFilter, repairTeachers } from "../controllers/teacher.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.route("/")
    .get(getTeachers)
    .post(authMiddleware(["superadmin", "admin"]), createTeacher);
router.route("/filter")
    .get(getTeachersForFilter);
router.route("/upload")
    .post(upload.single("file"), authMiddleware(["superadmin", "admin"]), createAllTeachers);
router.route("/repair")
    .get(authMiddleware(["superadmin", "admin"]), repairTeachers);
router.route("/delete/:teacherIds")
    .delete(authMiddleware(["superadmin", "admin"]), deleteTeachersByIds);
router.route("/:id")
    .delete(authMiddleware(["superadmin", "admin"]), deleteTeacher);

export default router;
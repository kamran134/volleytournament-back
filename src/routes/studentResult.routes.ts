import express from "express";
import multer from "multer";
import { createAllResults, deleteResults, getStudentResults } from "../controllers/studentResult.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.route("/").get(getStudentResults);
router.route("/upload")
    .post(upload.single("file"), authMiddleware(["superadmin", "admin"]), createAllResults);
router.route("/:examId")
    .delete(authMiddleware(["superadmin", "admin"]), deleteResults);

export default router;
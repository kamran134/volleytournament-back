import express from "express";
import multer from "multer";
import { createAllResults, deleteResults, getStudentResults } from "../controllers/studentResult.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.route("/").get(getStudentResults);
router.route("/upload").post(upload.single("file"), createAllResults);
router.route("/:examId").delete(deleteResults);

export default router;
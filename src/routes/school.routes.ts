import express from "express";
import multer from "multer";
import { createAllSchools, createSchool, getSchools, getSchoolsForFilter } from "../controllers/school.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.route("/").get(getSchools).post(createSchool);
router.route("/filter").get(getSchoolsForFilter);
router.route("/upload").post(upload.single("file"), createAllSchools);

export default router;
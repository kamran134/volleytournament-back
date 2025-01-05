import express from "express";
import { createAllDistricts, createDistrict, getDistricts } from "../controllers/district.controller";

const router = express.Router();

router.route("/").get(getDistricts).post(createDistrict);
router.route("/addAll").post(createAllDistricts);

export default router;
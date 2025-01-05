import express from "express";
import { createBooklet, getBooklets } from "../controllers/booklet.controller";

const router = express.Router();

router.route("/").get(getBooklets).post(createBooklet);

export default router;
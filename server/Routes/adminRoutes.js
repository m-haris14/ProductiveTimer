import express from "express";
import { getPendingReviews } from "../Controller/adminController.js";

const router = express.Router();

router.get("/admin/pending-reviews", getPendingReviews);

export default router;

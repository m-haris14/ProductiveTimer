import express from "express";
import {
    getPendingReviews,
    getPendingIdleRequests,
    approveIdleRequest,
    getIdleHistory
} from "../Controller/adminController.js";

const router = express.Router();

router.get("/admin/pending-reviews", getPendingReviews);
router.get("/admin/idle/pending", getPendingIdleRequests);
router.post("/admin/idle/approve/:idleId", approveIdleRequest);
router.get("/admin/idle/history/:employeeId", getIdleHistory);

export default router;

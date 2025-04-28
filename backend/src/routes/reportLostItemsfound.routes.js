import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  reportLostItemFound,
  deleteLostItemFound,
  updateReportedLostFoundStatus
} from "../controllers/reportLostItemFound.controller.js";

const router = express.Router();

// Route to report a lost item found
router.post("/report-lost-found", verifyJWT, reportLostItemFound);

// Route to delete a lost item found report
router.delete("/report-lost-found/:id", verifyJWT, deleteLostItemFound);

// Route to update the status of a lost item found report
router.patch("/report-lost-found/:id/status", verifyJWT, updateReportedLostFoundStatus);

export default router;

import express from "express";
import {
  createClaim,
  getClaimsForItem,
  getClaimsByUser,
  updateClaimStatus,
  deleteClaim,
} from "../controllers/claims.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/createClaim", verifyJWT, createClaim);
router.get("/user", verifyJWT, getClaimsByUser);
router.get("/item/:itemId", verifyJWT , getClaimsForItem);
router.put("/update/:claimId", verifyJWT, updateClaimStatus);
router.delete("/delete/:claimId", verifyJWT, deleteClaim);

export default router;

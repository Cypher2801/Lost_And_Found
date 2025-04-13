// controllers/claim.controller.js
import db from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createClaim = asyncHandler(async (req, res) => {
  const { item_id, message } = req.body;
  const claimer_id = req.user?.user_id;

  if (!item_id || !claimer_id) {
    throw new ApiError(400, "Missing required fields");
  }

  await db.query(
    `INSERT INTO claims (item_id, claimer_id, message) VALUES (?, ?, ?)`,
    [item_id, claimer_id, message || null]
  );

  res.status(201).json({ message: "Claim submitted successfully" });
});

export const getClaimsForItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const isAdmin = req.user.role === 'admin';
  if(!isAdmin){
    throw new ApiError(403, "Forbidden: Only admins can update claim status");
  }
  const [claims] = await db.query(
    `SELECT c.*, u.name AS claimer_name, u.email AS claimer_email
     FROM claims c JOIN users u ON c.claimer_id = u.user_id
     WHERE c.item_id = ?
     ORDER BY claimed_at DESC`,
    [itemId]
  );

  res.status(200).json({ claims });
});

export const getClaimsByUser = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;

  const [claims] = await db.query(
    `SELECT c.*, f.item_name FROM claims c JOIN found_items f ON c.item_id = f.item_id
     WHERE c.claimer_id = ?
     ORDER BY claimed_at DESC`,
    [userId]
  );

  res.status(200).json({ claims });
});

export const getClaimById = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const userId = req.user?.user_id;
  const isAdmin = req.user.role === 'admin';
  if(!isAdmin){
    throw new ApiError(403, "Forbidden: Only admins can update claim status");
  }
  const [[claim]] = await db.query(
    `SELECT c.*, u.name AS claimer_name, u.email AS claimer_email
     FROM claims c JOIN users u ON c.claimer_id = u.user_id
     WHERE c.claim_id = ? AND c.claimer_id = ?`,
    [claimId, userId]
  );

  if (!claim) {
    throw new ApiError(404, "Claim not found or not authorized");
  }

  res.status(200).json({ claim });
});

export const updateClaimStatus = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';
  if(!isAdmin){
    throw new ApiError(403, "Forbidden: Only admins can update claim status");
  }
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const [[claim]] = await db.query(
    `SELECT c.*, 
            f.user_id AS found_by, 
            u.email AS lost_user_email, 
            f.pickup_location AS pickup_location
     FROM claims c
     JOIN found_items f ON c.item_id = f.item_id
     JOIN users u ON f.user_id = u.user_id
     WHERE c.claim_id = ?`,
    [claimId]
  );
  

  if (!claim) {
    throw new ApiError(404, "Claim not found");
  }

  await db.query(
    `UPDATE claims SET claim_status = ? WHERE claim_id = ?`,
    [status, claimId]
  );
//   console.log(claim.pickup_location)
  if (status === 'approved') {
    await sendEmail({
      to: claim.lost_user_email,
      subject: "Your Found Item Has Been Claimed",
      text: `Someone has claimed the item you reported as found. Please coordinate pickup from ${claim.pickup_location} accordingly.`
    });
  }

  res.status(200).json({ message: "Claim status updated successfully" });
});

export const deleteClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const userId = req.user?.user_id;
  const isAdmin = req.user.role === 'admin';
  const [result] = await db.query(
    `DELETE FROM claims WHERE claim_id = ? AND claimer_id = ?`,
    [claimId, userId]
  );
  if (result.affectedRows === 0) {
    throw new ApiError(404, "Claim not found or not authorized");
  }

  res.status(200).json({ message: "Claim deleted successfully" });
});

import asyncHandler from "../utils/asyncHandler.js";
import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";

// ... Existing Lost Items Controllers (unchanged)

// Claims Controllers

// Create Claim
export const createClaim = asyncHandler(async (req, res) => {
  const { foundItemId, securityQuestionAnswer, message } = req.body;
  const claimingUser = req.user.userId;

  if (!foundItemId || !securityQuestionAnswer) {
    throw new ApiError(400, "Missing required fields");
  }

  await db.query(
    `INSERT INTO Claims (FoundItemID, securityQuestionAnswer, claimingUser, status, message)
     VALUES (?, ?, ?, 'Pending', ?)`,
    [foundItemId, securityQuestionAnswer, claimingUser, message || null]
  );

  res.status(201).json({ message: "Claim submitted successfully" });
});

// Get Claims for a Specific Item (Admin or Item Owner)
export const getClaimsForItem = asyncHandler(async (req, res) => {
  const { foundItemId } = req.params;
  const [claims] = await db.query(
    `SELECT * FROM Claims WHERE FoundItemID = ? ORDER BY created_at DESC`,
    [foundItemId]
  );
  res.status(200).json({ claims });
});

// Get All Claims by Logged-in User
export const getUserClaims = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const [claims] = await db.query(
    `SELECT * FROM Claims WHERE claimingUser = ? ORDER BY created_at DESC`,
    [userId]
  );
  res.status(200).json({ claims });
});

// Get Claim by ID
export const getClaimById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [claims] = await db.query(
    `SELECT * FROM Claims WHERE ClaimID = ?`,
    [id]
  );
  if (claims.length === 0) throw new ApiError(404, "Claim not found");
  res.status(200).json({ claim: claims[0] });
});

// Update Claim Status (Approve or Reject) — Only item owner or admin
export const updateClaimStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["Pending", "Approved", "Rejected"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid claim status");
  }

  await db.query(
    `UPDATE Claims SET status = ? WHERE ClaimID = ?`,
    [status, id]
  );

  // Fetch user email and found item info for notification
  const [[claim]] = await db.query(
    `SELECT c.claimingUser, u.email, fi.name AS itemName, fi.pickup_location
     FROM Claims c
     JOIN users u ON c.claimingUser = u.user_id
     JOIN FoundItems fi ON c.FoundItemID = fi.found_item_id
     WHERE c.ClaimID = ?`,
    [id]
  );

  if (claim) {
    let html = `
      <p>Dear user,</p>
      <p>Your claim for the item <strong>${claim.itemName}</strong> has been <strong>${status}</strong>.</p>
    `;

    if (status === "Approved") {
      html += `<p>You can collect the item from: <strong>${claim.pickup_location}</strong>.</p>`;
    }

    html += `
      <br>
      <p>Regards,<br>Lost & Found Team</p>
    `;

    const subject = `Your claim for "${claim.itemName}" has been ${status}`;

    await sendEmail({
      to: claim.email,
      subject,
      html,
    });
  }

  res.status(200).json({ message: `Claim status updated to ${status}` });
});

// Delete Claim (Only user who made the claim)
export const deleteClaim = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const [claims] = await db.query(
    `SELECT * FROM Claims WHERE ClaimID = ? AND claimingUser = ?`,
    [id, userId]
  );

  if (claims.length === 0) throw new ApiError(404, "Claim not found or unauthorized");

  await db.query(`DELETE FROM Claims WHERE ClaimID = ?`, [id]);
  res.status(200).json({ message: "Claim deleted successfully" });
});

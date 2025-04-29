import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import {ApiError} from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

// ... Existing Lost Items Controllers (unchanged)

// Claims Controllers

// Create Claim
export const createClaim = asyncHandler(async (req, res) => {
  const { found_item_id, security_answer_attempt, message } = req.body;
  const claiming_user_id = req.user.user_id;

  if (!found_item_id || !security_answer_attempt) {
    throw new ApiError(400, "Missing required fields");
  }

  await db.query(
    `INSERT INTO Claims (found_item_id, security_answer_attempt, claiming_user_id, status, message)
     VALUES (?, ?, ?, 'Pending', ?)`,
    [found_item_id, security_answer_attempt, claiming_user_id, message || null]
  );

  res.status(201).json({ message: "Claim submitted successfully" });
});

// Get Claims for a Specific Item (Admin or Item Owner)
export const getClaimsForItem = asyncHandler(async (req, res) => {
  const { found_item_id } = req.params;

  const [claims] = await db.query(
    `SELECT c.*, 
            f.name AS item_name, f.description AS item_description, f.found_date, f.found_location, 
            f.pickup_location, f.security_question, f.posted_by, f.category_id,
            u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number
     FROM Claims c
     JOIN FoundItems f ON c.found_item_id = f.found_item_id
     JOIN Users u ON f.posted_by = u.user_id
     WHERE c.found_item_id = ?
     ORDER BY c.created_at DESC`,
    [found_item_id]
  );

  const formattedClaims = claims.map(claim => {
    const {
      item_name, item_description, found_date, found_location, pickup_location, security_question,
      posted_by, category_id,
      user_name, roll_number, phone_number, hostel, room_number,
      ...claimData
    } = claim;

    return {
      ...claimData,
      foundItem: {
        name: item_name,
        description: item_description,
        found_date,
        found_location,
        pickup_location,
        security_question,
        category_id,
        posted_by,
        user: {
          name: user_name,
          roll_number,
          phone_number,
          hostel,
          room_number
        }
      }
    };
  });

  res.status(200).json({ claims: formattedClaims });
});

// Get All Claims by Logged-in User
export const getUserClaims = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  const [claims] = await db.query(
    `SELECT c.*, 
            f.name AS item_name, f.description AS item_description, f.found_date, f.found_location, 
            f.pickup_location, f.security_question, f.posted_by, f.category_id,
            u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number
     FROM Claims c
     JOIN FoundItems f ON c.found_item_id = f.found_item_id
     JOIN Users u ON f.posted_by = u.user_id
     WHERE c.claiming_user_id = ?
     ORDER BY c.created_at DESC`,
    [user_id]
  );

  const formattedClaims = claims.map(claim => {
    const {
      item_name, item_description, found_date, found_location, pickup_location, security_question, posted_by, category_id,
      user_name, roll_number, phone_number, hostel, room_number,
      ...claimData
    } = claim;

    return {
      ...claimData,
      foundItem: {
        name: item_name,
        description: item_description,
        found_date,
        found_location,
        pickup_location,
        security_question,
        category_id,
        posted_by,
        user: {
          name: user_name,
          roll_number,
          phone_number,
          hostel,
          room_number
        }
      }
    };
  });

  res.status(200).json({ claims: formattedClaims });
});

// Get Claim by ID
export const getClaimById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [claims] = await db.query(
    `SELECT c.*, 
            f.name AS item_name, f.description AS item_description, f.found_date, f.found_location, 
            f.pickup_location, f.security_question, f.posted_by, f.category_id,
            u.name AS user_name, u.roll_number, u.phone_number, u.hostel, u.room_number
     FROM Claims c
     JOIN FoundItems f ON c.found_item_id = f.found_item_id
     JOIN Users u ON f.posted_by = u.user_id
     WHERE c.claim_id = ?`,
    [id]
  );

  if (claims.length === 0) throw new ApiError(404, "Claim not found");

  const claim = claims[0];
  const {
    item_name, item_description, found_date, found_location, pickup_location,
    security_question, posted_by, category_id,
    user_name, roll_number, phone_number, hostel, room_number,
    ...claimData
  } = claim;

  res.status(200).json({
    claim: {
      ...claimData,
      foundItem: {
        name: item_name,
        description: item_description,
        found_date,
        found_location,
        pickup_location,
        security_question,
        category_id,
        posted_by,
        user: {
          name: user_name,
          roll_number,
          phone_number,
          hostel,
          room_number
        }
      }
    }
  });
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
    `UPDATE Claims SET status = ? WHERE claim_id = ?`,
    [status, id]
  );

  // Fetch user email and found item info for notification
  const [[claim]] = await db.query(
    `SELECT c.claiming_user_id, u.email, fi.name AS itemName, fi.pickup_location
     FROM Claims c
     JOIN users u ON c.claiming_user_id = u.user_id
     JOIN FoundItems fi ON c.found_item_id = fi.found_item_id
     WHERE c.claim_id = ?`,
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
  const user_id = req.user.user_id;

  const [claims] = await db.query(
    `SELECT * FROM Claims WHERE claim_id = ? AND claiming_user_id = ?`,
    [id, user_id]
  );

  if (claims.length === 0) throw new ApiError(404, "Claim not found or unauthorized");

  await db.query(`DELETE FROM Claims WHERE claim_id = ?`, [id]);
  res.status(200).json({ message: "Claim deleted successfully" });
});

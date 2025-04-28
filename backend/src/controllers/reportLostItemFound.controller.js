import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import {ApiError} from "../utils/ApiError.js";

// 1. Report a Lost Item Found
export const reportLostItemFound = asyncHandler(async (req, res) => {
  const { lostItemId, message, pickupLocation } = req.body;
  const userWhoFound = req.user.userId;

  if (!lostItemId || !pickupLocation) {
    throw new ApiError(400, "LostItemID and PickupLocation are required.");
  }

  await db.query(
    `INSERT INTO ReportedLostFound (LostItemID, Message, Status, UserWhoFound, PickupLocation)
     VALUES (?, ?, 'Pending', ?, ?)`,
    [lostItemId, message || null, userWhoFound, pickupLocation]
  );

  res.status(201).json({ message: "Lost item reported as found successfully." });
});

// 2. Delete a Lost Item Found Report
export const deleteLostItemFound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const [report] = await db.query(
    `SELECT * FROM ReportedLostFound WHERE ReportID = ? AND UserWhoFound = ?`,
    [id, userId]
  );

  if (report.length === 0) {
    throw new ApiError(404, "Report not found or you're not authorized to delete it.");
  }

  await db.query(`DELETE FROM ReportedLostFound WHERE ReportID = ?`, [id]);
  res.status(200).json({ message: "Report deleted successfully." });
});

// 3. Update Report Status (e.g., mark as Returned)
export const updateReportedLostFoundStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["Pending", "Returned"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status. Use 'Pending' or 'Returned'.");
  }

  const [report] = await db.query(`SELECT * FROM ReportedLostFound WHERE ReportID = ?`, [id]);
  if (report.length === 0) {
    throw new ApiError(404, "Report not found");
  }

  await db.query(
    `UPDATE ReportedLostFound SET Status = ? WHERE ReportID = ?`,
    [status, id]
  );

  res.status(200).json({ message: `Status updated to ${status}` });
});

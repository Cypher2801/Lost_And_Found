import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import {ApiError} from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

// 1. Report a Lost Item Found
export const reportLostItemFound = asyncHandler(async (req, res) => {
  const { lost_item_id, message, pickup_location } = req.body;
  const userWhoFound = req.user.user_id;

  if (!lost_item_id || !pickup_location) {
    throw new ApiError(400, "lost_item_id and pickup_location are required.");
  }

  // Insert the report
  await db.query(
    `INSERT INTO ReportedLostFound (lost_item_id, message, status, user_who_found, pickup_location)
     VALUES (?, ?, 'Pending', ?, ?)`,
    [lost_item_id, message || null, userWhoFound, pickup_location]
  );

  // Fetch the lost item
  const [lostItems] = await db.query(
    `SELECT * FROM lostitems WHERE lost_item_id = ?`,
    [lost_item_id]
  );
  const lostItem = lostItems[0];

  if (!lostItem) {
    throw new ApiError(404, "Lost item not found");
  }

  // Fetch the user who posted the lost item
  const [userRows] = await db.query(
    `SELECT name, email FROM users WHERE user_id = ?`,
    [lostItem.posted_by]
  );
  const originalUser = userRows[0];

  // Send email notification
  if (originalUser?.email) {
    await sendEmail({
      to: originalUser.email,
      subject: "Someone Reported Finding Your Lost Item",
      html: `
        <p>Hi ${originalUser.name},</p>
        <p>Good news! Someone has reported finding an item that matches what you lost.</p>
        <p><strong>Pickup Location:</strong> ${pickup_location}</p>
        <p><strong>Message from Finder:</strong> ${message || "No message provided"}</p>
        <p>Please log in to the Lost & Found portal to review and respond to the report.</p>
        <br/>
        <p>Best regards,<br/>Lost & Found Help Desk</p>
      `,
    });
  }

  res.status(201).json({ message: "Lost item reported and user notified via email." });
});

export const getItemsReportedByUser = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  const [reports] = await db.query(
    `SELECT * FROM reportedlostfound WHERE user_who_found = ? ORDER BY created_at DESC`,
    [user_id]
  );

  const detailedReports = await Promise.all(
    reports.map(async (report) => {
      // Fetch lost item details
      const [lostItems] = await db.query(
        `SELECT * FROM lostitems WHERE lost_item_id = ?`,
        [report.lost_item_id]
      );

      const lostItem = lostItems[0] || null;

      let photos = [];
      if (lostItem) {
        const [photoRows] = await db.query(
          `SELECT photo_url FROM lostitemphotos WHERE lost_item_id = ?`,
          [lostItem.lost_item_id]
        );
        photos = photoRows.map(photo => photo.photo_url);

        // Fetch user who posted the lost item
        const [userRows] = await db.query(
          `SELECT name, roll_number, phone_number, hostel, room_number FROM users WHERE user_id = ?`,
          [lostItem.posted_by]
        );

        lostItem.user = userRows[0] || null;
        lostItem.photos = photos;
      }

      return {
        ...report,
        lost_item: lostItem
      };
    })
  );

  res.status(200).json({ reports: detailedReports });
});

export const getReportsAboutUserLostItems = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  // Get all reports where the lost item belongs to the current user
  const [reports] = await db.query(
    `SELECT r.* FROM reportedlostfound r
     JOIN lostitems l ON r.lost_item_id = l.lost_item_id
     WHERE l.posted_by = ?
     ORDER BY r.created_at DESC`,
    [user_id]
  );

  const detailedReports = await Promise.all(
    reports.map(async (report) => {
      // Get lost item details
      const [lostItems] = await db.query(
        `SELECT * FROM lostitems WHERE lost_item_id = ?`,
        [report.lost_item_id]
      );
      const lostItem = lostItems[0] || null;

      let photos = [];
      if (lostItem) {
        const [photoRows] = await db.query(
          `SELECT photo_url FROM lostitemphotos WHERE lost_item_id = ?`,
          [lostItem.lost_item_id]
        );
        photos = photoRows.map(p => p.photo_url);
        lostItem.photos = photos;
      }

      // Get user who found the item
      const [foundUserRows] = await db.query(
        `SELECT name, roll_number, phone_number, hostel, room_number FROM users WHERE user_id = ?`,
        [report.user_who_found]
      );
      const foundUser = foundUserRows[0] || null;

      return {
        ...report,
        lost_item: lostItem,
        found_user: foundUser
      };
    })
  );

  res.status(200).json({ reports: detailedReports });
});


// 2. Delete a Lost Item Found Report
export const deleteLostItemFound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  const [report] = await db.query(
    `SELECT * FROM ReportedLostFound WHERE report_id = ? AND user_who_found = ?`,
    [id, user_id]
  );

  if (report.length === 0) {
    throw new ApiError(404, "Report not found or you're not authorized to delete it.");
  }

  await db.query(`DELETE FROM ReportedLostFound WHERE report_id = ?`, [id]);
  res.status(200).json({ message: "Report deleted successfully." });
});

// 3. Update Report status (e.g., mark as Returned)
export const updateReportedLostFoundStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["Pending", "Returned"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status. Use 'Pending' or 'Returned'.");
  }

  const [report] = await db.query(`SELECT * FROM ReportedLostFound WHERE report_id = ?`, [id]);
  if (report.length === 0) {
    throw new ApiError(404, "Report not found");
  }

  await db.query(
    `UPDATE ReportedLostFound SET status = ? WHERE report_id = ?`,
    [status, id]
  );

  res.status(200).json({ message: `status updated to ${status}` });
});

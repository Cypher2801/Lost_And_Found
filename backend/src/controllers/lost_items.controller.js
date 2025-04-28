import {asyncHandler} from "../utils/asyncHandler.js";
import db from "../db/index.js";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ... Existing Found Items Controllers (unchanged)

// Report Lost Item
export const reportLostItem = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const {
    name,
    description,
    lostDate,
    lostLocation,
    categoryID
  } = req.body;

  if (!name || !description || !lostDate || !lostLocation || !categoryID) {
    throw new ApiError(400, "All fields are required to report a lost item");
  }

  const photoUrls = [];
  if (req.files && req.files.photos && req.files.photos.length > 0) {
    for (const file of req.files.photos) {
      const result = await uploadOnCloudinary(file.path);
      photoUrls.push(result.url);
    }
  } else {
    throw new ApiError(400, "At least one photo is required");
  }

  const [result] = await db.query(
    `INSERT INTO LostItems (name, description, photo1, photo2, photo3, lostDate, lostLocation, postedBy, categoryID)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      photoUrls[0],
      photoUrls[1] || null,
      photoUrls[2] || null,
      lostDate,
      lostLocation,
      userId,
      categoryID
    ]
  );

  res.status(201).json({ message: "Lost item reported successfully" });
});

// Get Lost Item by ID
export const getLostItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [items] = await db.query("SELECT * FROM LostItems WHERE LostItemID = ?", [id]);

  if (items.length === 0) throw new ApiError(404, "Item not found");
  res.status(200).json({ item: items[0] });
});

// Get All Lost Items
export const getAllLostItems = asyncHandler(async (req, res) => {
  const [items] = await db.query("SELECT * FROM LostItems ORDER BY lostDate DESC");
  res.status(200).json({ items });
});

// Get User's Lost Items
export const getLostItemByUser = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const [items] = await db.query("SELECT * FROM LostItems WHERE postedBy = ? ORDER BY lostDate DESC", [userId]);

  res.status(200).json({ items });
});

// Delete Lost Item
export const deleteLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const [items] = await db.query("SELECT * FROM LostItems WHERE LostItemID = ? AND postedBy = ?", [id, userId]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query("DELETE FROM LostItems WHERE LostItemID = ?", [id]);
  res.status(200).json({ message: "Lost item deleted successfully" });
});

// Update Lost Item Details (excluding photos)
export const updateLostItemDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { name, description, lostDate, lostLocation, categoryID } = req.body;

  const [items] = await db.query("SELECT * FROM LostItems WHERE LostItemID = ? AND postedBy = ?", [id, userId]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query(
    `UPDATE LostItems SET name = ?, description = ?, lostDate = ?, lostLocation = ?, categoryID = ? WHERE LostItemID = ?`,
    [name, description, lostDate, lostLocation, categoryID, id]
  );

  res.status(200).json({ message: "Lost item details updated successfully" });
});

// Update Lost Item Images
export const updateLostItemImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const [items] = await db.query("SELECT * FROM LostItems WHERE LostItemID = ? AND postedBy = ?", [id, userId]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  const photoUrls = [];
  if (req.files && req.files.photos && req.files.photos.length > 0) {
    for (const file of req.files.photos) {
      const result = await uploadOnCloudinary(file.path);
      photoUrls.push(result.url);
    }
  } else {
    throw new ApiError(400, "At least one image must be provided");
  }

  await db.query(
    `UPDATE LostItems SET photo1 = ?, photo2 = ?, photo3 = ? WHERE LostItemID = ?`,
    [photoUrls[0], photoUrls[1] || null, photoUrls[2] || null, id]
  );

  res.status(200).json({ message: "Images updated successfully" });
});

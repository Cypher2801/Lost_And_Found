import asyncHandler from "../utils/asyncHandler.js";
import db from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Report Found Item
export const reportFoundItem = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const {
    name,
    description,
    foundDate,
    foundLocation,
    pickupLocation,
    securityQuestion,
    securityAnswer,
    categoryID
  } = req.body;

  if (!name || !description || !foundDate || !foundLocation || !pickupLocation || !securityQuestion || !securityAnswer || !categoryID) {
    throw new ApiError(400, "All fields are required to report a found item");
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
    `INSERT INTO FoundItems (name, description, photo1, photo2, photo3, foundDate, foundLocation, pickupLocation, securityQuestion, securityAnswer, postedBy, categoryID)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      photoUrls[0],
      photoUrls[1] || null,
      photoUrls[2] || null,
      foundDate,
      foundLocation,
      pickupLocation,
      securityQuestion,
      securityAnswer,
      userId,
      categoryID
    ]
  );

  res.status(201).json({ message: "Found item reported successfully" });
});

// Delete Found Item
export const deleteFoundItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE FoundItemID = ? AND postedBy = ?", [id, userId]);

  if (items.length === 0) {
    throw new ApiError(404, "Item not found or unauthorized");
  }

  await db.query("DELETE FROM FoundItems WHERE FoundItemID = ?", [id]);
  res.status(200).json({ message: "Item deleted successfully" });
});

// Update Found Item Details (excluding photos and pickupLocation)
export const updateFoundItemDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { name, description, foundDate, foundLocation, categoryID } = req.body;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE FoundItemID = ? AND postedBy = ?", [id, userId]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query(
    `UPDATE FoundItems SET name = ?, description = ?, foundDate = ?, foundLocation = ?, categoryID = ? WHERE FoundItemID = ?`,
    [name, description, foundDate, foundLocation, categoryID, id]
  );

  res.status(200).json({ message: "Found item details updated successfully" });
});

// Update Found Item Images
export const updateFoundItemImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE FoundItemID = ? AND postedBy = ?", [id, userId]);
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
    `UPDATE FoundItems SET photo1 = ?, photo2 = ?, photo3 = ? WHERE FoundItemID = ?`,
    [photoUrls[0], photoUrls[1] || null, photoUrls[2] || null, id]
  );

  res.status(200).json({ message: "Images updated successfully" });
});

// Update Pickup Location
export const updatePickupPlace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { pickupLocation } = req.body;

  const [items] = await db.query("SELECT * FROM FoundItems WHERE FoundItemID = ? AND postedBy = ?", [id, userId]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query("UPDATE FoundItems SET pickupLocation = ? WHERE FoundItemID = ?", [pickupLocation, id]);
  res.status(200).json({ message: "Pickup location updated successfully" });
});

// Get User's Found Items
export const getUserFoundItems = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const [items] = await db.query("SELECT * FROM FoundItems WHERE postedBy = ? ORDER BY foundDate DESC", [userId]);

  res.status(200).json({ items });
});

// Get Found Item by ID
export const getFoundItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [items] = await db.query("SELECT * FROM FoundItems WHERE FoundItemID = ?", [id]);

  if (items.length === 0) throw new ApiError(404, "Item not found");
  res.status(200).json({ item: items[0] });
});

// Get All Found Items
export const getAllFoundItems = asyncHandler(async (req, res) => {
  const [items] = await db.query("SELECT * FROM FoundItems ORDER BY foundDate DESC");
  res.status(200).json({ items });
});

// Update Security Question and Answer
export const updateFoundItemSecurityQA = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { securityQuestion, securityAnswer } = req.body;

  if (!securityQuestion || !securityAnswer) {
    throw new ApiError(400, "Both question and answer are required");
  }

  const [items] = await db.query("SELECT * FROM FoundItems WHERE FoundItemID = ? AND postedBy = ?", [id, userId]);
  if (items.length === 0) throw new ApiError(404, "Item not found or unauthorized");

  await db.query(
    "UPDATE FoundItems SET securityQuestion = ?, securityAnswer = ? WHERE FoundItemID = ?",
    [securityQuestion, securityAnswer, id]
  );

  res.status(200).json({ message: "Security question and answer updated successfully" });
});

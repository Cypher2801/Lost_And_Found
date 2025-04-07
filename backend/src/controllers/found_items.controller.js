import db from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

export const reportFoundItem = asyncHandler(async (req, res) => {
  const { item_name, description, found_location, pickup_location, found_date } = req.body;
  const userId = req.user?.user_id;

  if (!item_name || !found_location  || !userId) {
    throw new ApiError(400, "Required fields missing");
  }

  let imageUrl = null;
  if (req.files && Array.isArray(req.files.image) && req.files.image.length > 0) {
    const localPath = req.files.image[0].path;
    try {
      const cloudinaryResult = await uploadOnCloudinary(localPath);
      imageUrl = cloudinaryResult.url;
    } catch (error) {
      throw new ApiError(500, "Image upload failed");
    }
  }

  await db.query(
    `INSERT INTO found_items (user_id, item_name, description, found_location, pickup_location, found_date, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, item_name, description, found_location, pickup_location, found_date, imageUrl]
  );

  res.status(201).json({ message: "Found item reported successfully" });
});

export const deleteFoundItem = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  const { itemId } = req.params;

  if (!itemId || !userId) {
    throw new ApiError(400, "Missing item ID or unauthorized");
  }

  const [result] = await db.query(`DELETE FROM found_items WHERE item_id = ? AND user_id = ?`, [itemId, userId]);
  if (result.affectedRows === 0) {
    throw new ApiError(404, "Found item not found or not authorized to delete");
  }

  res.status(200).json({ message: "Found item deleted successfully" });
});

export const updateFoundItem = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  const { itemId } = req.params;
  const { item_name, description, found_location, pickup_location, found_date } = req.body;

  if (!itemId || !userId) {
    throw new ApiError(400, "Missing item ID or unauthorized");
  }

  let imageUrl = null;
  if (req.files && Array.isArray(req.files.image) && req.files.image.length > 0) {
    const localPath = req.files.image[0].path;
    try {
      const cloudinaryResult = await uploadOnCloudinary(localPath);
      imageUrl = cloudinaryResult.url;
    } catch (error) {
      throw new ApiError(500, "Image upload failed");
    }
  }

  const [result] = await db.query(
    `UPDATE found_items SET item_name = ?, description = ?, found_location = ?, pickup_location = ?, found_date = ?, image_url = COALESCE(?, image_url)
     WHERE item_id = ? AND user_id = ?`,
    [item_name, description, found_location, pickup_location, found_date, imageUrl, itemId, userId]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Found item not found or not authorized to update");
  }

  res.status(200).json({ message: "Found item updated successfully" });
});

export const getUserFoundItems = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;
  if (!userId) throw new ApiError(401, "Unauthorized access");

  const [items] = await db.query(`SELECT * FROM found_items WHERE user_id = ?`, [userId]);
  res.status(200).json({ items });
});

export const getAllFoundItems = asyncHandler(async (req, res) => {
  const [items] = await db.query(
    `SELECT f.*, u.name as reporter_name, u.email as reporter_email
     FROM found_items f
     JOIN users u ON f.user_id = u.user_id
     ORDER BY found_date DESC`
  );
  res.status(200).json({ items });
});

export const getFoundItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [items] = await db.query(
    `SELECT f.*, u.name as reporter_name FROM found_items f
     JOIN users u ON f.user_id = u.user_id
     WHERE f.item_id = ?`,
    [id]
  );

  if (items.length === 0) {
    throw new ApiError(404, "Item not found");
  }

  res.status(200).json({ item: items[0] });
});

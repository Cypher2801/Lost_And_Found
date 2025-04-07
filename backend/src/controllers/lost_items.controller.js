import db from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

// Get lost item by ID
export const getLostItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [items] = await db.query(
    `SELECT l.*, u.name as reporter_name FROM lost_items l
     JOIN users u ON l.user_id = u.user_id
     WHERE l.item_id = ?`,
    [id]
  );

  if (items.length === 0) {
    throw new ApiError(404, "Item not found");
  }

  res.status(200).json({ item: items[0] });
});

export const reportLostItem = asyncHandler(async (req, res) => {
  try {
    const { item_name, description, lost_location, lost_date } = req.body;
    const userId = req.user?.user_id;

    if (!item_name || !lost_location || !userId) {
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
      `INSERT INTO lost_items (user_id, item_name, description, lost_location, lost_date, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, item_name, description, lost_location, lost_date, imageUrl]
    );

    res.status(201).json({ message: "Lost item reported successfully" });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to report lost item", error.errors, error.stack);
  }
});

export const getLostItems = asyncHandler(async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT l.*, u.name as reporter_name, u.email as reporter_email
       FROM lost_items l
       JOIN users u ON l.user_id = u.user_id
       ORDER BY lost_date DESC`
    );
    res.status(200).json({ items });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch lost items", error.errors, error.stack);
  }
});

export const getLostItemByUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized access");

    const [items] = await db.query(`SELECT * FROM lost_items WHERE user_id = ?`, [userId]);
    res.status(200).json({ items });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to fetch user's lost items", error.errors, error.stack);
  }
});

export const deleteLostItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { itemId } = req.params;

    if (!itemId || !userId) {
      throw new ApiError(400, "Missing item ID or unauthorized");
    }

    const [result] = await db.query(`DELETE FROM lost_items WHERE item_id = ? AND user_id = ?`, [itemId, userId]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, "Lost item not found or not authorized to delete");
    }

    res.status(200).json({ message: "Lost item deleted successfully" });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to delete lost item", error.errors, error.stack);
  }
});

export const updateLostItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { itemId } = req.params;
    const { item_name, description, lost_location, lost_date } = req.body;

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
      `UPDATE lost_items SET item_name = ?, description = ?, lost_location = ?, lost_date = ?, image_url = COALESCE(?, image_url)
       WHERE item_id = ? AND user_id = ?`,
      [item_name, description, lost_location, lost_date, imageUrl, itemId, userId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Lost item not found or not authorized to update");
    }

    res.status(200).json({ message: "Lost item updated successfully" });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Failed to update lost item", error.errors, error.stack);
  }
});

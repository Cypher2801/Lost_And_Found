// routes/foundItems.js
import express from "express";
import {
  reportFoundItem,
  deleteFoundItem,
  updateFoundItem,
  getUserFoundItems,
  getAllFoundItems,
  getFoundItemById,
} from "../controllers/found_items.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/report", 
    verifyJWT, 
    upload.fields([{ name: "image" }]), 
    reportFoundItem
);
router.delete("/delete/:itemId", 
    verifyJWT, 
    deleteFoundItem);
router.put("/update/:itemId", 
    verifyJWT, 
    upload.fields([{ name: "image" }]), 
    updateFoundItem
);
router.get("/user", 
    verifyJWT, 
    getUserFoundItems
);
router.get("/getAllItems", 
    getAllFoundItems
);
router.get("/getItem/:id", 
    getFoundItemById
);

export default router;

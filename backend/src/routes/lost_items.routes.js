import { Router } from "express";
import { 
     getLostItemById,
     getLostItemByUser,
     getLostItems,
     reportLostItem,
     updateLostItem,
     deleteLostItem
} from "../controllers/lost_items.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
const router = Router();

router.route("/report").post(
    verifyJWT,
    upload.fields([
        {
            name : "image",
            maxCount : 1
        }
    ]),
    reportLostItem
)
router.route("/update/:itemId").put(
    verifyJWT,
    upload.fields([
        {
            name : "image",
            maxCount : 1
        }
    ]),
    updateLostItem    
)
router.route("/delete/:itemId").delete(
    verifyJWT,
    deleteLostItem
)
router.route("/get-all").get(
    getLostItems
)
router.route("/findItem/:id").get(
    getLostItemById
)
router.route("/user/:userId").get(
    getLostItemByUser
)


export default router
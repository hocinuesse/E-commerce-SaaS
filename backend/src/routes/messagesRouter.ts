import { Router } from "express";
import {
  createMessage,
  getMessagesByShop,
  deleteMessage,
  markMessageAsRead,
} from "../controllers/createMessage";
import asyncWrapper from "../utils/asyncWrapper";
import protect from "../middlewares/protect";
import authorizedRoles from "../middlewares/authorizedRoles";
import { UserRole } from "../interfaces/IUser";

const router = Router();

// Public route: Customers can send messages to a shop
router.post("/create-message", asyncWrapper(createMessage));

// Protected routes: Only authorized shop vendors, managers, or admin can read/manage messages
router.use(protect, authorizedRoles(UserRole.VENDOR, UserRole.MANAGER, UserRole.ADMIN));

router.get("/get-messages/:shopId", asyncWrapper(getMessagesByShop));
router.delete("/delete-message/:messageId", asyncWrapper(deleteMessage));
router.patch("/mark-message-as-read/:messageId", asyncWrapper(markMessageAsRead));

export default router;

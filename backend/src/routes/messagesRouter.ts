import { Router } from "express";
import {
  createMessage,
  getMessagesByShop,
  deleteMessage,
  markMessageAsRead,
} from "../controllers/createMessage";
import asyncWrapper from "../utils/asyncWrapper";

const router = Router();

router.post("/create-message", asyncWrapper(createMessage));
router.get("/get-messages/:shopId", asyncWrapper(getMessagesByShop));
router.delete("/delete-message/:messageId", asyncWrapper(deleteMessage));
router.patch("/mark-message-as-read/:messageId", asyncWrapper(markMessageAsRead));

export default router;
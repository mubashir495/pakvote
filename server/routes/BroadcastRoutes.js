import express from "express";
import {
  sendMessage,
  getMessages,
  getConversation,
  markAsRead,
  deleteMessage,
  getMyMessages,
  getContacts
} from "../controllers/BroadcastController.js";

import { protect } from "../middlewares/authMiddlewares.js";
import { partyOnly } from "../middlewares/isRoleMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/", protect, getMessages);
router.get("/contacts", protect, getContacts);
router.get("/conversation/:userId", protect, getConversation);
router.put("/read/:messageId", protect, markAsRead);
router.delete("/:messageId", partyOnly, deleteMessage);
router.get("/my-messages", protect, getMyMessages);
export default router;
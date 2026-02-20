import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
  getSingleContactMessage,
  deleteContactMessage,
} from "../controllers/contactusController.js";
import { protect } from "../middlewares/authMiddlewares.js";
const router = express.Router();

router.post("/", createContactMessage);
router.get("/", protect, getAllContactMessages);
router.get("/:id", protect, getSingleContactMessage);
router.delete("/:id", protect, deleteContactMessage);

export default router;

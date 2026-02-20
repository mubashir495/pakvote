import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  deleteComplaint,
} from "../controllers/complaintController.js"; 

import { protect } from "../middlewares/authMiddlewares.js";
import { adminOnly } from "../middlewares/isRoleMiddleware.js";

const router = express.Router();
router.post("/", createComplaint);
router.get("/", protect, adminOnly, getAllComplaints);
router.get("/:id", protect, getComplaintById);
router.delete("/:id", protect, adminOnly, deleteComplaint);

export default router;

import express from "express";
import {
  createParty,
  getAllParties,
  getSingleParty,
  updateParty,
  deleteParty,
getPartyByUserId,
} from "../controllers/partyController.js";
import { protect } from "../middlewares/authMiddlewares.js"
import { adminOnly } from "../middlewares/isRoleMiddleware.js";


const router = express.Router();

router.post("/", protect, adminOnly, createParty);
router.get("/", getAllParties);
router.get("/user/:userId", getPartyByUserId);
router.get("/:id", getSingleParty);
router.put("/:id",adminOnly, protect, updateParty);
router.delete("/:id", protect, adminOnly, deleteParty);

export default router;

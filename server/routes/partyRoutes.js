import express from "express";
import {
  createParty,
  getAllParties,
  getSingleParty,
  updateParty,
  deleteParty,
  getPartyByUserId,
  getMyPartyCandidates,
  getMyPartyMPAResults,
} from "../controllers/partyController.js";
import { protect } from "../middlewares/authMiddlewares.js"
import { adminOnly, partyOnly } from "../middlewares/isRoleMiddleware.js";


const router = express.Router();

router.post("/", protect, adminOnly, createParty);
router.get("/", getAllParties);
router.get("/me/candidates", protect, partyOnly, getMyPartyCandidates);
router.get("/me/mpa-results", protect, partyOnly, getMyPartyMPAResults);
router.get("/user/:userId", getPartyByUserId);
router.get("/:id", getSingleParty);
router.put("/:id", protect,adminOnly, updateParty);
router.delete("/:id", protect, adminOnly, deleteParty);

export default router;

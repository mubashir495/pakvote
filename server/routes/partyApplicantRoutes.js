import express from "express";
import {
  createPartyApplicant,
  getAllPartyApplicants,
  getPartyApplicantById,
  updatePartyStatus,
  deletePartyApplicant,
} from "../controllers/partyApplicantController.js";

import { partyUpload } from "../utils/upload.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { adminOnly } from "../middlewares/isRoleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  partyUpload.fields([
    { name: "payement_prof", maxCount: 1 },
    { name: "party_constitution_document", maxCount: 1 },
  ]),
  createPartyApplicant
);

router.get("/", protect, adminOnly, getAllPartyApplicants);
router.get("/:id", protect, getPartyApplicantById);
router.put("/:id/status", protect, adminOnly, updatePartyStatus);
router.delete("/:id", protect, adminOnly, deletePartyApplicant);

export default router;

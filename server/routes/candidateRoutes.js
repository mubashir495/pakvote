import express from "express";
import {
  createCandidateApplicant,
  getAllCandidateApplicants,
  getCandidateApplicantById,
  getPartyCandidates,
  getIndependentCandidates,
  updateCandidateApplicant,
  deleteCandidateApplicant,
} from "../controllers/candidateController.js";

import { protect } from "../middlewares/authMiddlewares.js";
import { adminOnly } from "../middlewares/isRoleMiddleware.js";
const router = express.Router();
router.post("/", protect, createCandidateApplicant);
router.get("/", protect, adminOnly, getAllCandidateApplicants);
router.get("/party", protect, adminOnly, getPartyCandidates);
router.get("/independent", protect, adminOnly, getIndependentCandidates);
router.get("/:id", protect, adminOnly, getCandidateApplicantById);
router.put("/:id", protect, adminOnly, updateCandidateApplicant);
router.delete("/:id", protect, adminOnly, deleteCandidateApplicant);

export default router;

import express from "express";
import {
  createCandidate,
  getAllCandidateApplicants,
  getCandidateApplicantById,
  getCandidatesByParty,
  getIndependentCandidates,
  updateCandidateApplicant,
  deleteCandidateApplicant,
  getCandidateByUserId,
  getPartyCandidatesByUser,
  getCandidatesByBothConstituencies,
} from "../controllers/candidateController.js";

import { protect } from "../middlewares/authMiddlewares.js";
import { adminOnly, partyOnly } from "../middlewares/isRoleMiddleware.js";
const router = express.Router();
router.post("/", protect, createCandidate);
router.get("/", protect, adminOnly, getAllCandidateApplicants);
router.get("/party/:partyID", protect, getCandidatesByParty);
router.get("/independent",  getIndependentCandidates);
router.get("/by-constituencies", getCandidatesByBothConstituencies);
router.get("/:id", protect, adminOnly, getCandidateApplicantById);
router.put("/:id", protect, adminOnly, updateCandidateApplicant);
router.delete("/:id", protect, adminOnly, deleteCandidateApplicant);
router.get("/party-depandance/:userId" , getPartyCandidatesByUser);
router.get("/user/:userId", getCandidateByUserId);

export default router;

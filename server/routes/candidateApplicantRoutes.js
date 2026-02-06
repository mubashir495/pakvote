import express from "express";
import { upload } from "../utils/upload.js";
import { protect } from "../middlewares/authMiddlewares.js";
import {
  addCandidateApplicant,
  deleteCandidateApplicant,
  getAllCandidatesApplicant,
  getCandidatesApplicantByParty,
  getMyCandidateApplicantDetails,
} from "../controllers/candidateApplicantController.js";

const router = express.Router();
router.post("/", protect, upload.array("degreesFiles", 5), addCandidateApplicant);
router.delete("/:id", protect, deleteCandidateApplicant);
router.get("/", getAllCandidatesApplicant);
router.get("/party/:partyId", getCandidatesApplicantByParty);
router.get("/me", protect, getMyCandidateApplicantDetails);

export default router;

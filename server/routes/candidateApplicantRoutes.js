import express from "express";
import { upload } from "../utils/upload.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { adminOnly } from "../middlewares/isRoleMiddleware.js";

import { checkPhaseMiddleware } from "../controllers/settingsController.js";
import {
  addCandidateApplicant,
  deleteCandidateApplicant,
  getAllCandidatesApplicant,
  getCandidatesApplicantByParty,
  getMyCandidateApplicantDetails,
  updateCandidateStatus
} from "../controllers/candidateApplicantController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  checkPhaseMiddleware("candidate"),
  upload.array("degreesFiles", 5),
  addCandidateApplicant
);
router.delete(
  "/:id",
  protect,
  deleteCandidateApplicant
);
router.get(
  "/",
  protect,
  adminOnly,
  getAllCandidatesApplicant
);
router.get(
  "/party/:partyId",
  protect,
  adminOnly,
  getCandidatesApplicantByParty
);
router.get(
  "/",
  protect,
  getMyCandidateApplicantDetails
);
router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateCandidateStatus
);

export default router;
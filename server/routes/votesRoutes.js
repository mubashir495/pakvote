import express from "express";
import { castVote,getFullConstituencyResults, getAdminElectionResults } from "../controllers/voterController.js"
import { protect } from "../middlewares/authMiddlewares.js";
import { checkPhaseMiddleware } from "../controllers/settingsController.js";
const router = express.Router();
router.post("/", protect, checkPhaseMiddleware("voting"), castVote);
router.get("/constituency-results/:constituencyID", protect, getFullConstituencyResults);
router.get("/admin-results", protect, getAdminElectionResults);

export default router;
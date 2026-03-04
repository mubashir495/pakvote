import express from "express";
import { castVote,getFullConstituencyResults } from "../controllers/voterController.js"
import { protect } from "../middlewares/authMiddlewares.js";
const router = express.Router();
router.post("/", protect , castVote);
router.get("/constituency-results/:constituencyID", protect, getFullConstituencyResults);

export default router;
import express from "express";
import {
  createConstituency,
  getAllConstituencies,
  getConstituencyById,
  updateConstituency,
  deleteConstituency,
  getConstituenciesByTehsil,
  getAllMPASeatsAndWinners,
} from "../controllers/constituencyPPController.js";
import { protect } from "../middlewares/authMiddlewares.js"
import { adminOnly } from "../middlewares/isRoleMiddleware.js";

const router = express.Router();

router.get("/all-mpa-results", protect, adminOnly, getAllMPASeatsAndWinners);
router.post("/", createConstituency);
router.get("/", getAllConstituencies);
router.get("/:id", getConstituencyById);
router.put("/:id", updateConstituency);
router.delete("/:id", deleteConstituency);

router.get("/tehsil/:tehsilId", getConstituenciesByTehsil);

export default router;

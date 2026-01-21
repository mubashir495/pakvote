import express from "express";
import {
  createConstituency,
  getAllConstituencies,
  getConstituencyById,
  updateConstituency,
  deleteConstituency,
  getConstituenciesByTehsil,
} from "../controllers/constituencyController.js";

const router = express.Router();

router.post("/", createConstituency);
router.get("/", getAllConstituencies);
router.get("/:id", getConstituencyById);
router.put("/:id", updateConstituency);
router.delete("/:id", deleteConstituency);

router.get("/tehsil/:tehsilId", getConstituenciesByTehsil);

export default router;

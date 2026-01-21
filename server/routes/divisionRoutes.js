import express from "express";

import {
  getDivisionById,
  getAllDivision,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionByProvince
} from "../controllers/divisionController.js";

const router = express.Router();

router.post("/", createDivision);
router.get("/", getAllDivision);
router.get("/:id", getDivisionById);
router.put("/:id", updateDivision);
router.delete("/:id", deleteDivision);
router.get("/province/:id", getDivisionByProvince);

export default router;

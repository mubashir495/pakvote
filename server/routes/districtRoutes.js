import express from "express";

import {
  createDistrict,
  getAllDistricts,
  getDistrictById,
  updateDistrict,
  deleteDistrict,
  getDistrictsByDivision,
} from "../controllers/districtController.js";

const router = express.Router();

router.post("/",createDistrict);
router.get("/",getAllDistricts);
router.get("/:id",getDistrictById);
router.put("/:id",updateDistrict);
router.delete("/:id",deleteDistrict);
router.get("/division/:id",getDistrictsByDivision);

export default router;
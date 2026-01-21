import express, { Router } from "express";

import {
  createProvince,
  getAllProvinces,
  getProvinceById,
  updateProvince,
  deleteProvince
} from "../controllers/provinceController.js";

const router = express.Router()
router.post("/",createProvince);
router.get("/",getAllProvinces);
router.get("/:id",getProvinceById);
router.put("/:id",updateProvince);
router.delete("/:id",deleteProvince)

export default router;
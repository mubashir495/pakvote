import express from "express";
import { getProvinceHierarchy } from "../controllers/provinceHierarchyController.js";

const router = express.Router();
router.get("/province/:provinceId", getProvinceHierarchy);
export default router;

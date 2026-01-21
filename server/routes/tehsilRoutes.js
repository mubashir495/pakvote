import express from "express";
import {
  createTehsil,
  getAllTehsils,
  getTehsilById,
  updateTehsil,
  deleteTehsil,
  getTehsilsByDistrict,
} from "../controllers/tehsilController.js";

const router = express.Router();

router.post("/", createTehsil);
router.get("/", getAllTehsils);
router.get("/:id", getTehsilById);
router.put("/:id", updateTehsil);
router.delete("/:id", deleteTehsil);

// Get all tehsils by district
router.get("/district/:id", getTehsilsByDistrict);

export default router;

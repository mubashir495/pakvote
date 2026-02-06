import express from "express";
import {
  createSymbol,
  updateSymbol,
  getAllSymbols,
  getSymbolById,
  deleteSymbol,
} from "../controllers/symbolController.js";
import { symbolUpload } from "../utils/upload.js";
const router = express.Router();

// CRUD routes
router.post("/", symbolUpload.single("image"), createSymbol);
router.put("/:id", symbolUpload.single("image"), updateSymbol);
router.get("/", getAllSymbols);
router.get("/:id", getSymbolById);
router.delete("/:id", deleteSymbol);

export default router;
